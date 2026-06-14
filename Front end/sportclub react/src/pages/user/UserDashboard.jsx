import { useState, useEffect } from "react";
import { Card, Button, Badge, Row, Col, ProgressBar, Form, Table, Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import { getHeaders, getToken } from "../../services/authService";

const API_URL_USERS = "http://localhost:3000/api/users";

function UserDashboard() {
  const [userSession, setUserSession] = useState({ name: "Socio", email: "" });
  const [routine, setRoutine] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({ exercise: "", weight: "" });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const token = getToken();
      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const resUser = await fetch("http://localhost:3000/api/auth/me", {
          headers: getHeaders()
        });

        if (!resUser.ok) {
          window.location.replace("/login");
          return;
        }

        const userData = await resUser.json();
        const realUser = userData.data || userData;
        const activeUser = {
          id: realUser.id,
          name: realUser.full_name,
          email: realUser.email,
          role: realUser.role
        };

        setUserSession(activeUser);

        const responseMetadata = realUser.metadata || {};
        const attendanceData = responseMetadata.attendance || { count: 0, last_checkin: null };
        const today = new Date().toISOString().split("T")[0];

        setMetadata(responseMetadata);
        setAttendanceCount(attendanceData.count || 0);
        setHasCheckedIn(attendanceData.last_checkin === today);
        setPersonalRecords(Array.isArray(responseMetadata.records) ? responseMetadata.records : []);

        const resRoutines = await fetch("http://localhost:3000/api/routines", {
          headers: getHeaders()
        });

        if (resRoutines.ok) {
          const rutinasData = await resRoutines.json();
          const rutinas = rutinasData.data || rutinasData;
          const myRoutine = rutinas.find(r => 
            r.client_name?.toString().trim().toLowerCase() === activeUser.name.toString().trim().toLowerCase()
          );

          if (myRoutine) {
            setRoutine(myRoutine);
          }
        }
      } catch (error) {
        console.error("Error crítico:", error);
      }
    };

    initData();
  }, []);

  const handleCheckIn = async () => {
    Swal.fire({
      title: "¿Registrar asistencia?",
      text: "¿Deseas registrar tu asistencia para hoy?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("http://localhost:3000/api/auth/me", {
            headers: getHeaders()
          });

          if (!response.ok) throw new Error("No se pudo verificar el usuario.");

          const resultUser = await response.json();
          const currentUser = resultUser.data || resultUser;
          const metadataPayload = {
            ...currentUser.metadata,
            attendance: {
              count: (currentUser.metadata?.attendance?.count || 0) + 1,
              last_checkin: new Date().toISOString().split("T")[0]
            }
          };

          const updateResponse = await fetch("http://localhost:3000/api/auth/me", {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ metadata: metadataPayload })
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || "Error al actualizar asistencia.");
          }

          setMetadata(metadataPayload);
          setAttendanceCount(metadataPayload.attendance.count);
          setHasCheckedIn(true);

          Swal.fire("¡Asistencia Registrada!", "Tu día ha sido sumado con éxito.", "success");
        } catch (error) {
          Swal.fire("Error", error.message || "No se pudo guardar la asistencia.", "error");
        }
      }
    });
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!newRecord.exercise || !newRecord.weight) return;

    Swal.fire({
      title: "¿Confirmar nuevo hito?",
      text: `¿Deseas guardar ${newRecord.weight} kg en ${newRecord.exercise}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      confirmButtonText: "Sí, guardar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch("http://localhost:3000/api/auth/me", {
            headers: getHeaders()
          });

          if (!response.ok) throw new Error("No se pudo verificar el usuario.");

          const resultUser = await response.json();
          const currentUser = resultUser.data || resultUser;
          const existingRecords = Array.isArray(currentUser.metadata?.records) ? currentUser.metadata.records : [];

          const newEntry = {
            id: Date.now(),
            exercise: newRecord.exercise,
            weight: `${newRecord.weight} kg`,
            date: new Date().toISOString().split("T")[0]
          };

          const metadataPayload = {
            ...currentUser.metadata,
            records: [...existingRecords, newEntry]
          };

          const updateResponse = await fetch("http://localhost:3000/api/auth/me", {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ metadata: metadataPayload })
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || "Error al guardar el récord.");
          }

          setMetadata(metadataPayload);
          setPersonalRecords(metadataPayload.records || []);
          setNewRecord({ exercise: "", weight: "" });
          setShowModal(false);

          Swal.fire("¡Récord Guardado!", "Tu marca ha sido registrada.", "success");
        } catch (error) {
          Swal.fire("Error", error.message || "No se pudo guardar el récord.", "error");
        }
      }
    });
  };

  const handleEditRecord = async (record) => {
    const currentWeight = (record.weight || "").toString().replace(/\D/g, "");
    const { value: newWeight } = await Swal.fire({
      title: `Editar peso - ${record.exercise}`,
      input: 'number',
      inputLabel: 'Peso (kg)',
      inputValue: currentWeight,
      showCancelButton: true,
      inputAttributes: {
        min: 1,
        step: 1
      },
      preConfirm: (val) => {
        if (!val || Number(val) <= 0) {
          Swal.showValidationMessage('Introduce un peso válido mayor que 0');
        }
        return val;
      }
    });

    if (!newWeight) return;

    try {
      const updatedRecords = personalRecords.map(r => r.id === record.id ? { ...r, weight: `${newWeight} kg` } : r);

      const updateResponse = await fetch("http://localhost:3000/api/auth/me", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ metadata: { ...metadata, records: updatedRecords } })
      });

      if (!updateResponse.ok) {
        const err = await updateResponse.json();
        throw new Error(err.message || 'No se pudo actualizar el récord');
      }

      const result = await updateResponse.json();
      const updatedMetadata = result.data?.metadata || { ...metadata, records: updatedRecords };
      setMetadata(updatedMetadata);
      setPersonalRecords(updatedMetadata.records || updatedRecords);

      Swal.fire('Actualizado', 'El récord ha sido actualizado en el servidor.', 'success');
    } catch (error) {
      console.error('Edit record error:', error);
      Swal.fire('Error', error.message || 'No se pudo actualizar el récord.', 'error');
    }
  };

  const handleDeleteRecord = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar récord? ',
      text: 'Esta acción eliminará permanentemente el récord seleccionado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const updatedRecords = personalRecords.filter(r => r.id !== id);

      const updateResponse = await fetch("http://localhost:3000/api/auth/me", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ metadata: { ...metadata, records: updatedRecords } })
      });

      if (!updateResponse.ok) {
        const err = await updateResponse.json();
        throw new Error(err.message || 'No se pudo eliminar el récord');
      }

      const result = await updateResponse.json();
      const updatedMetadata = result.data?.metadata || { ...metadata, records: updatedRecords };
      setMetadata(updatedMetadata);
      setPersonalRecords(updatedMetadata.records || updatedRecords);

      Swal.fire('Eliminado', 'El récord ha sido eliminado.', 'success');
    } catch (error) {
      console.error('Delete record error:', error);
      Swal.fire('Error', error.message || 'No se pudo eliminar el récord.', 'error');
    }
  };

  const handleShowProfile = async () => {
    if (!userSession) {
      Swal.fire("Error", "Los datos del usuario no están cargados aún.", "error");
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: "Editar Perfil",
      html: `
        <input id="swal-name" class="swal2-input" value="${userSession.name}">
        <input id="swal-email" class="swal2-input" value="${userSession.email}">
        <hr>
        <input type="password" id="swal-curr-pass" class="swal2-input" placeholder="Contraseña Actual">
        <input type="password" id="swal-new-pass" class="swal2-input" placeholder="Nueva Contraseña">
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      preConfirm: () => ({
        full_name: document.getElementById("swal-name").value,
        email: document.getElementById("swal-email").value,
        current_password: document.getElementById("swal-curr-pass").value,
        new_password: document.getElementById("swal-new-pass").value
      })
    });

    if (formValues) {
      try {
        const resProfile = await fetch("http://localhost:3000/api/auth/me", {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ 
            full_name: formValues.full_name, 
            email: formValues.email 
          })
        });

        if (!resProfile.ok) throw new Error("Error al actualizar perfil");

        if (formValues.new_password && formValues.new_password.trim() !== "") {
          const resPass = await fetch("http://localhost:3000/api/auth/me/password", {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ 
              current_password: formValues.current_password, 
              new_password: formValues.new_password, 
              confirm_password: formValues.new_password 
            })
          });

          const result = await resPass.json();
          if (!resPass.ok) throw new Error(result.message || "Error al cambiar contraseña");
        }

        Swal.fire("¡Éxito!", "Cambios guardados. Por favor, refresca la página para ver los cambios.", "success");
        setUserSession(prev => ({...prev, name: formValues.full_name, email: formValues.email}));
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="container mt-4">
      {/* HEADER */}
      <div className="bg-primary text-white p-4 rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center" style={{ backgroundImage: "linear-gradient(45deg, #0d6efd, #0dcaf0)" }}>
        
        <div>
          <h2 className="fw-bold mb-1">¡Hola de nuevo, {userSession.name}! ✨</h2>
          <p className="mb-0 text-white-50">Tu disciplina de hoy construye tu fuerza de mañana.</p>
          
          {/* --- PEGA ESTO AQUÍ ABAJO --- */}
          <Button 
            variant="light" 
            size="sm" 
            className="mt-2" 
            onClick={handleShowProfile}
          >
            Mi Perfil
          </Button>
          {/* ---------------------------- */}
          
        </div>

        <Button 
          variant={hasCheckedIn ? "light" : "warning"} 
          className="fw-bold shadow px-4 py-2.5 rounded-pill text-dark text-uppercase" 
          onClick={handleCheckIn} 
          disabled={hasCheckedIn}
        >
          {hasCheckedIn ? "✓ Asistencia Registrada" : "🎯 Marcar Asistencia"}
        </Button>
      </div>

      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center bg-white p-3 rounded-4">
            <h6 className="text-secondary text-uppercase small fw-bold mb-2">Asistencias este Mes</h6>
            <h2 className="fw-extrabold text-primary display-5 mb-1">{attendanceCount}</h2>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="border-0 shadow-sm bg-white p-4 rounded-4 h-100 justify-content-center">
            <h6 className="text-secondary text-uppercase small fw-bold mb-2">Meta de Entrenamientos Mensual</h6>
            <ProgressBar animated variant="info" now={(attendanceCount / 20) * 100} style={{ height: "15px" }} className="rounded-pill shadow-sm" />
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        {/* COLUMNA RUTINA */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <Card.Header className="bg-light py-3 border-0 rounded-top-4">
              <h5 className="mb-0 fw-bold text-dark text-uppercase small">📋 Mi Plan de Entrenamiento Oficial</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {routine ? (
                <div>
                  <h4 className="fw-bold text-primary">{routine.objective}</h4>
                  <Row className="text-center mt-3">
                    <Col xs={6} className="border-end"><span className="text-muted small">Frecuencia</span><h5 className="fw-bold">{routine.days_per_week} días</h5></Col>
                    <Col xs={6}><span className="text-muted small">Complejidad</span><br/><Badge bg={routine.difficulty === "Advanced" ? "danger" : "info"}>{routine.difficulty === "Advanced" ? "Avanzado" : routine.difficulty === "Intermediate" ? "Intermedio" : "Principiante"}</Badge></Col>
                  </Row>
                </div>
              ) : <p className="text-center py-5 text-muted">No tienes una planificación técnica cargada aún.</p>}
            </Card.Body>
          </Card>
        </Col>

        {/* COLUMNA RÉCORDS */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <Card.Header className="bg-light py-3 border-0 rounded-top-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark text-uppercase small">🔥 Mis Récords</h5>
              <Button size="sm" variant="outline-primary" onClick={() => setShowModal(true)}>+ Agregar</Button>
            </Card.Header>
            <Card.Body className="p-4">
              <Table responsive hover className="small mb-0">
                <thead>
                  <tr>
                    <th>Ejercicio</th>
                    <th>Peso</th>
                    <th>Fecha</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personalRecords.map(r => (
                    <tr key={r.id}>
                      <td className="fw-bold">{r.exercise}</td>
                      <td><Badge bg="warning" className="text-dark">{r.weight}</Badge></td>
                      <td>{r.date}</td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleEditRecord(r)}>Editar</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteRecord(r.id)}>Borrar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Registrar Récord</Modal.Title></Modal.Header>
        <Form onSubmit={handleAddRecord}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Ejercicio</Form.Label>
              <Form.Control required value={newRecord.exercise} onChange={(e) => setNewRecord({...newRecord, exercise: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Peso (kg)</Form.Label>
              <Form.Control type="number" required value={newRecord.weight} onChange={(e) => setNewRecord({...newRecord, weight: e.target.value})} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
            <Button type="submit" variant="success">Guardar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default UserDashboard;

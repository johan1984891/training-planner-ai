// ============================================================
//  Tab3_Video.tsx — Video y Seguimiento de Progreso
//  Simulación de análisis de video + retroalimentación AI
// ============================================================

import React, { useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonText, IonBadge, IonChip, IonIcon, IonList, IonItem,
  IonLabel, IonProgressBar, IonGrid, IonRow, IonCol,
  IonTextarea, IonToast, IonSegment, IonSegmentButton,
  IonAlert,
} from "@ionic/react";
import {
  videocamOutline, checkmarkCircle, warningOutline,
  trendingUpOutline, closeCircleOutline, cloudUploadOutline,
  documentTextOutline, statsChartOutline,
} from "ionicons/icons";
import { usePlayer } from "../context/PlayerContext";
import { generateVideoFeedback } from "../logic/trainingAI";

// Lista de errores comunes que el jugador puede marcar manualmente
const ERRORES_DISPONIBLES = [
  "Codo afuera en tiro",
  "No dobla rodillas",
  "Cabeza abajo driblando",
  "Mal pivote",
  "No hace box-out",
  "Pase telegrafíado",
  "Posición defensiva alta",
  "Falta de explosividad",
];

const Tab3Video: React.FC = () => {
  // ─── Estados locales ───────────────────────────────────
  const [segmento, setSegmento] = useState<string>("video");
  const [videoSimulado, setVideoSimulado] = useState<boolean>(false);
  const [cargandoVideo, setCargandoVideo] = useState<boolean>(false);
  const [erroresSeleccionados, setErroresSeleccionados] = useState<string[]>([]);
  const [notasLibres, setNotasLibres] = useState<string>("");
  const [feedbackGenerado, setFeedbackGenerado] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Estado global
  const { state, dispatch } = usePlayer();

  // ─── Simular subida de video ───────────────────────────
  const handleSimularVideo = () => {
    setCargandoVideo(true);
    setTimeout(() => {
      setVideoSimulado(true);
      setCargandoVideo(false);
      setToastMsg("📹 Video cargado. Ahora marca los errores que identificaste.");
      setShowToast(true);
    }, 2000);
  };

  // ─── Toggle de error detectado ─────────────────────────
  const toggleError = (error: string) => {
    setErroresSeleccionados((prev) =>
      prev.includes(error)
        ? prev.filter((e) => e !== error)
        : [...prev, error]
    );
  };

  // ─── Generar retroalimentación AI ─────────────────────
  const handleGenerarFeedback = () => {
    if (!state.perfil) {
      setToastMsg("⚠️ Primero crea tu perfil en el Tab 1.");
      setShowToast(true);
      return;
    }

    const fb = generateVideoFeedback(erroresSeleccionados, state.perfil);
    dispatch({ type: "SET_FEEDBACK", payload: fb });

    // Guardar entrada de progreso
    const entrada = {
      fecha: new Date().toLocaleDateString("es-ES"),
      ejerciciosCompletados: ERRORES_DISPONIBLES.length - erroresSeleccionados.length,
      notas: notasLibres || "Sin notas adicionales.",
      puntuacion: fb.puntuacion,
    };
    dispatch({ type: "ADD_PROGRESO", payload: entrada });

    setFeedbackGenerado(true);
    setToastMsg("✅ Retroalimentación generada. ¡Revisa tu análisis!");
    setShowToast(true);
    setSegmento("feedback");
  };

  // ─── Reiniciar sesión ─────────────────────────────────
  const handleReset = () => {
    setVideoSimulado(false);
    setErroresSeleccionados([]);
    setNotasLibres("");
    setFeedbackGenerado(false);
    dispatch({ type: "RESET_FEEDBACK" });
  };

  // ─── Color del score ──────────────────────────────────
  const scoreColor = (p: number) =>
    p >= 80 ? "success" : p >= 60 ? "warning" : "danger";

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="dark">
          <IonTitle>
            <IonIcon icon={videocamOutline} style={{ marginRight: 8 }} />
            Video & Seguimiento
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" color="light">

        {/* ── Selector de sección ── */}
        <IonSegment
          value={segmento}
          onIonChange={(e) => setSegmento(e.detail.value as string)}
          color="dark"
          style={{ marginBottom: 16 }}
        >
          <IonSegmentButton value="video">
            <IonIcon icon={videocamOutline} />
            <IonLabel>Video</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="feedback">
            <IonIcon icon={documentTextOutline} />
            <IonLabel>Feedback</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="progreso">
            <IonIcon icon={statsChartOutline} />
            <IonLabel>Progreso</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* ═══════════════════════════ SECCIÓN: VIDEO ═══════════════════════════ */}
        {segmento === "video" && (
          <>
            {/* Simulador de video */}
            <IonCard style={{ borderRadius: 12 }}>
              <IonCardHeader>
                <IonCardTitle>📹 Simulador de Video</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {/* Área de "preview" simulada */}
                <div
                  style={{
                    background: videoSimulado ? "#1a1a2e" : "#2a2a2a",
                    borderRadius: 10,
                    height: 180,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: videoSimulado ? "2px solid #ffd534" : "2px dashed #555",
                    marginBottom: 12,
                    transition: "all 0.4s ease",
                  }}
                >
                  {cargandoVideo ? (
                    <>
                      <div style={{ fontSize: "2rem" }}>⏳</div>
                      <IonText color="medium"><small>Procesando video...</small></IonText>
                      <IonProgressBar
                        type="indeterminate"
                        color="warning"
                        style={{ width: "60%", marginTop: 8 }}
                      />
                    </>
                  ) : videoSimulado ? (
                    <>
                      <div style={{ fontSize: "3rem" }}>🏀</div>
                      <IonText color="warning">
                        <strong>training_session_01.mp4</strong>
                      </IonText>
                      <IonText color="medium">
                        <small>Duración: 4:32 min · HD 1080p</small>
                      </IonText>
                    </>
                  ) : (
                    <>
                      <IonIcon
                        icon={cloudUploadOutline}
                        style={{ fontSize: "3rem", color: "#555" }}
                      />
                      <IonText color="medium">
                        <small>No hay video cargado</small>
                      </IonText>
                    </>
                  )}
                </div>

                <IonButton
                  expand="block"
                  color={videoSimulado ? "medium" : "primary"}
                  onClick={handleSimularVideo}
                  disabled={cargandoVideo}
                >
                  <IonIcon icon={cloudUploadOutline} slot="start" />
                  {videoSimulado ? "Reemplazar video" : "Simular subida de video"}
                </IonButton>
              </IonCardContent>
            </IonCard>

            {/* Selección de errores detectados */}
            {videoSimulado && (
              <>
                <IonCard style={{ borderRadius: 12 }}>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={warningOutline} color="warning" style={{ marginRight: 6 }} />
                      Errores Detectados{" "}
                      <IonBadge color="danger">{erroresSeleccionados.length}</IonBadge>
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText color="medium">
                      <small>
                        Marca los errores que identificaste en el video.
                        La IA generará correcciones específicas.
                      </small>
                    </IonText>
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {ERRORES_DISPONIBLES.map((error) => (
                        <IonChip
                          key={error}
                          color={erroresSeleccionados.includes(error) ? "danger" : "medium"}
                          outline={!erroresSeleccionados.includes(error)}
                          onClick={() => toggleError(error)}
                        >
                          {erroresSeleccionados.includes(error) && (
                            <IonIcon icon={checkmarkCircle} />
                          )}
                          <IonLabel style={{ fontSize: "0.8rem" }}>{error}</IonLabel>
                        </IonChip>
                      ))}
                    </div>
                  </IonCardContent>
                </IonCard>

                {/* Notas libres */}
                <IonCard style={{ borderRadius: 12 }}>
                  <IonCardHeader>
                    <IonCardTitle>📝 Notas de la sesión</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonTextarea
                      value={notasLibres}
                      onIonInput={(e) => setNotasLibres(e.detail.value!)}
                      placeholder="Ej: Hoy me sentí cansado, la muñeca todavía me molesta... cualquier observación que quieras recordar."
                      rows={3}
                      style={{ fontSize: "0.9rem" }}
                    />
                  </IonCardContent>
                </IonCard>

                {/* Botón generar feedback */}
                <IonButton
                  expand="block"
                  color="warning"
                  style={{ fontWeight: "bold" }}
                  onClick={handleGenerarFeedback}
                >
                  <IonIcon icon={trendingUpOutline} slot="start" />
                  🤖 Generar Retroalimentación AI
                </IonButton>
              </>
            )}
          </>
        )}

        {/* ═══════════════════════════ SECCIÓN: FEEDBACK ═══════════════════════════ */}
        {segmento === "feedback" && (
          <>
            {!state.videoFeedback ? (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <IonText color="medium">
                  <h3>🔍 Sin análisis aún</h3>
                  <p>Ve al tab "Video", sube un video y genera la retroalimentación.</p>
                </IonText>
              </div>
            ) : (
              <>
                {/* Score general */}
                <IonCard color="dark" style={{ borderRadius: 16 }}>
                  <IonCardContent style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "3.5rem",
                        fontWeight: "bold",
                        color:
                          state.videoFeedback.puntuacion >= 80
                            ? "#2dd36f"
                            : state.videoFeedback.puntuacion >= 60
                            ? "#ffd534"
                            : "#eb445a",
                      }}
                    >
                      {state.videoFeedback.puntuacion}
                    </div>
                    <IonText color="light">
                      <small>Puntuación de sesión</small>
                    </IonText>
                    <IonProgressBar
                      value={state.videoFeedback.puntuacion / 100}
                      color={scoreColor(state.videoFeedback.puntuacion) as any}
                      style={{ marginTop: 10, height: 8, borderRadius: 8 }}
                    />
                    <IonText color="warning">
                      <p style={{ marginTop: 12, fontStyle: "italic" }}>
                        "{state.videoFeedback.mensaje}"
                      </p>
                    </IonText>
                  </IonCardContent>
                </IonCard>

                {/* Errores + correcciones */}
                {state.videoFeedback.recomendaciones.length > 0 && (
                  <IonCard style={{ borderRadius: 12 }}>
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={warningOutline} color="danger" style={{ marginRight: 6 }} />
                        Correcciones AI
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList lines="none">
                        {state.videoFeedback.recomendaciones.map((rec, i) => (
                          <IonItem key={i} style={{ "--padding-start": "0", alignItems: "flex-start" }}>
                            <IonIcon
                              icon={closeCircleOutline}
                              color="danger"
                              slot="start"
                              style={{ minWidth: 20, marginTop: 3 }}
                            />
                            <IonLabel
                              style={{
                                fontSize: "0.88rem",
                                whiteSpace: "normal",
                                lineHeight: 1.5,
                              }}
                              className="ion-text-wrap"
                            >
                              {rec}
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                )}

                {/* Puntos fuertes */}
                {state.videoFeedback.puntosFuertes.length > 0 && (
                  <IonCard style={{ borderRadius: 12 }}>
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={checkmarkCircle} color="success" style={{ marginRight: 6 }} />
                        Puntos Fuertes
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList lines="none">
                        {state.videoFeedback.puntosFuertes.map((pf, i) => (
                          <IonItem key={i} style={{ "--padding-start": "0" }}>
                            <IonIcon
                              icon={checkmarkCircle}
                              color="success"
                              slot="start"
                              style={{ minWidth: 20 }}
                            />
                            <IonLabel
                              style={{ fontSize: "0.88rem", whiteSpace: "normal" }}
                              className="ion-text-wrap"
                            >
                              {pf}
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                )}

                <IonButton
                  expand="block"
                  color="medium"
                  fill="outline"
                  onClick={() => setShowConfirmReset(true)}
                >
                  🔄 Nueva Sesión
                </IonButton>
              </>
            )}
          </>
        )}

        {/* ═══════════════════════════ SECCIÓN: PROGRESO ═══════════════════════════ */}
        {segmento === "progreso" && (
          <>
            <IonCard style={{ borderRadius: 12 }}>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={statsChartOutline} style={{ marginRight: 6 }} />
                  Historial de Sesiones
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {state.progreso.length === 0 ? (
                  <IonText color="medium">
                    <p style={{ textAlign: "center" }}>
                      Aún no tienes sesiones registradas. Completa tu primera sesión de video.
                    </p>
                  </IonText>
                ) : (
                  <IonList lines="inset">
                    {[...state.progreso].reverse().map((entry, i) => (
                      <IonItem key={i}>
                        <IonGrid style={{ padding: "4px 0" }}>
                          <IonRow className="ion-align-items-center">
                            <IonCol size="7">
                              <IonText color="dark">
                                <strong>📅 {entry.fecha}</strong>
                              </IonText>
                              <br />
                              <IonText color="medium">
                                <small>{entry.notas.slice(0, 60)}...</small>
                              </IonText>
                            </IonCol>
                            <IonCol size="5" style={{ textAlign: "right" }}>
                              <IonBadge
                                color={scoreColor(entry.puntuacion) as any}
                                style={{ fontSize: "1rem", padding: "6px 10px" }}
                              >
                                {entry.puntuacion} pts
                              </IonBadge>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>

            {/* Estadística de tendencia */}
            {state.progreso.length >= 2 && (
              <IonCard color="dark" style={{ borderRadius: 12 }}>
                <IonCardContent>
                  {(() => {
                    const scores = state.progreso.map((p) => p.puntuacion);
                    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                    const trend =
                      scores[scores.length - 1] >= scores[scores.length - 2] ? "📈" : "📉";
                    return (
                      <>
                        <IonText color="warning">
                          <h3>{trend} Tendencia de Progreso</h3>
                        </IonText>
                        <IonText color="light">
                          <p>
                            Promedio general: <strong>{avg} pts</strong>
                          </p>
                          <p>
                            Mejor sesión:{" "}
                            <strong>{Math.max(...scores)} pts</strong>
                          </p>
                          <p>
                            Sesiones completadas:{" "}
                            <strong>{state.progreso.length}</strong>
                          </p>
                        </IonText>
                      </>
                    );
                  })()}
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}

        {/* ── Toast de notificaciones ── */}
        <IonToast
          isOpen={showToast}
          message={toastMsg}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
          position="top"
        />

        {/* ── Alert de confirmación de reset ── */}
        <IonAlert
          isOpen={showConfirmReset}
          header="¿Nueva sesión?"
          message="Se borrará el feedback actual. ¿Continuar?"
          buttons={[
            { text: "Cancelar", role: "cancel" },
            {
              text: "Sí, nueva sesión",
              role: "confirm",
              handler: () => {
                handleReset();
                setSegmento("video");
              },
            },
          ]}
          onDidDismiss={() => setShowConfirmReset(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab3Video;

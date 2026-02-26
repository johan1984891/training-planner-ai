// ============================================================
//  Tab2_Plan.tsx — Plan de Entrenamiento Personalizado
//  Genera y visualiza el plan semanal con lógica AI
// ============================================================

import React, { useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonText, IonBadge, IonAccordion, IonAccordionGroup,
  IonItem, IonLabel, IonIcon, IonProgressBar, IonChip,
  IonGrid, IonRow, IonCol, IonSpinner, IonList,
} from "@ionic/react";
import {
  calendarOutline, flashOutline, timeOutline,
  ribbonOutline, checkmarkDoneOutline, alertCircleOutline,
} from "ionicons/icons";
import { usePlayer } from "../context/PlayerContext";
import { generateTrainingPlan, Exercise } from "../logic/trainingAI";

// ─── Colores para categorías de ejercicio ────────────────
const categoriaColor: Record<string, string> = {
  físico: "danger",
  técnico: "primary",
  táctico: "tertiary",
  mental: "warning",
};

// ─── Colores para intensidad ─────────────────────────────
const intensidadColor: Record<string, string> = {
  baja: "success",
  media: "warning",
  alta: "danger",
};

const Tab2Plan: React.FC = () => {
  const { state, dispatch } = usePlayer();
  const [generando, setGenerando] = useState(false);

  // ─── Generar plan con el motor AI ─────────────────────
  const handleGenerarPlan = () => {
    if (!state.perfil) return;

    setGenerando(true);

    // Simulamos un leve delay para efecto de "procesamiento AI"
    setTimeout(() => {
      const plan = generateTrainingPlan(state.perfil!);
      dispatch({ type: "SET_PLAN", payload: plan });
      setGenerando(false);
    }, 1200);
  };

  // ─── Pantalla cuando no hay perfil ───────────────────
  if (!state.perfil) {
    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <IonToolbar color="dark">
            <IonTitle>Plan Personalizado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" color="light">
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <IonText color="medium">
              <h3>⚠️ Sin perfil</h3>
              <p>Primero completa tu perfil en el Tab 1 para generar tu plan de entrenamiento.</p>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="dark">
          <IonTitle>
            <IonIcon icon={calendarOutline} style={{ marginRight: 8 }} />
            Plan Semanal AI
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" color="light">

        {/* ── Banner del jugador ── */}
        <IonCard color="dark" style={{ borderRadius: 16 }}>
          <IonCardContent>
            <IonGrid style={{ padding: 0 }}>
              <IonRow className="ion-align-items-center">
                <IonCol size="8">
                  <IonText color="warning">
                    <h3 style={{ margin: 0 }}>🏀 {state.perfil.nombre}</h3>
                  </IonText>
                  <IonText color="light">
                    <small>
                      {state.perfil.posicion} · {state.perfil.altura}cm · {state.perfil.nivel}
                    </small>
                  </IonText>
                </IonCol>
                <IonCol size="4" style={{ textAlign: "right" }}>
                  <IonBadge
                    color={
                      state.perfil.nivel === "principiante"
                        ? "success"
                        : state.perfil.nivel === "intermedio"
                        ? "warning"
                        : "danger"
                    }
                    style={{ fontSize: "0.85rem", padding: "6px 10px" }}
                  >
                    {state.perfil.nivel}
                  </IonBadge>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* ── Botón generar plan ── */}
        <IonButton
          expand="block"
          color={state.planSemanal ? "medium" : "warning"}
          style={{ margin: "12px 0", fontWeight: "bold" }}
          onClick={handleGenerarPlan}
          disabled={generando}
        >
          {generando ? (
            <>
              <IonSpinner name="crescent" style={{ marginRight: 8 }} />
              Generando plan AI...
            </>
          ) : (
            <>
              <IonIcon icon={flashOutline} slot="start" />
              {state.planSemanal ? "♻️ Regenerar Plan" : "⚡ Generar Plan Semanal"}
            </>
          )}
        </IonButton>

        {/* ── Contenido del plan ── */}
        {state.planSemanal && (
          <>
            {/* Mensaje motivacional */}
            <IonCard color="warning" style={{ borderRadius: 12 }}>
              <IonCardContent>
                <IonText color="dark">
                  <p style={{ margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                    💬 "{state.planSemanal.mensajeMotivacional}"
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>

            {/* Intensidad general + estadísticas */}
            <IonCard style={{ borderRadius: 12 }}>
              <IonCardHeader>
                <IonCardTitle>📊 Intensidad del Plan</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid style={{ padding: 0 }}>
                  <IonRow>
                    <IonCol size="4" style={{ textAlign: "center" }}>
                      <IonText color="primary">
                        <h2 style={{ margin: 0 }}>{state.planSemanal.nivelIntensidadGeneral}/10</h2>
                      </IonText>
                      <IonText color="medium"><small>Intensidad</small></IonText>
                    </IonCol>
                    <IonCol size="4" style={{ textAlign: "center" }}>
                      <IonText color="warning">
                        <h2 style={{ margin: 0 }}>
                          {state.planSemanal.dias.filter((d) => !d.descanso).length}
                        </h2>
                      </IonText>
                      <IonText color="medium"><small>Días activos</small></IonText>
                    </IonCol>
                    <IonCol size="4" style={{ textAlign: "center" }}>
                      <IonText color="success">
                        <h2 style={{ margin: 0 }}>
                          {state.planSemanal.dias
                            .reduce((acc, d) => acc + d.duracionEstimada, 0)}{" "}
                          min
                        </h2>
                      </IonText>
                      <IonText color="medium"><small>Total semanal</small></IonText>
                    </IonCol>
                  </IonRow>
                </IonGrid>
                <IonProgressBar
                  value={state.planSemanal.nivelIntensidadGeneral / 10}
                  color={
                    state.planSemanal.nivelIntensidadGeneral < 5
                      ? "success"
                      : state.planSemanal.nivelIntensidadGeneral < 8
                      ? "warning"
                      : "danger"
                  }
                  style={{ borderRadius: 8, marginTop: 12, height: 10 }}
                />
              </IonCardContent>
            </IonCard>

            {/* Objetivos de la semana */}
            <IonCard style={{ borderRadius: 12 }}>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={ribbonOutline} style={{ marginRight: 6 }} />
                  Objetivos de la Semana
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  {state.planSemanal.objetivosSemana.map((obj, i) => (
                    <IonItem key={i} style={{ "--padding-start": "0" }}>
                      <IonIcon
                        icon={checkmarkDoneOutline}
                        color="success"
                        slot="start"
                        style={{ minWidth: 20 }}
                      />
                      <IonLabel
                        style={{ fontSize: "0.9rem", whiteSpace: "normal" }}
                        className="ion-text-wrap"
                      >
                        {obj}
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* Plan día a día con acordeón */}
            <IonText>
              <h4 style={{ paddingLeft: 8, color: "#666" }}>📅 Plan Día a Día</h4>
            </IonText>

            <IonAccordionGroup>
              {state.planSemanal.dias.map((dia, idx) => (
                <IonAccordion key={idx} value={dia.dia}>
                  {/* Cabecera del día */}
                  <IonItem slot="header" color={dia.descanso ? "medium" : "dark"}>
                    <IonText>
                      <strong>{dia.descanso ? "🌙" : "🔥"} {dia.dia}</strong>
                      <br />
                      <small style={{ color: "#aaa" }}>{dia.enfoque}</small>
                    </IonText>
                    <div slot="end" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <IonIcon icon={timeOutline} color="medium" />
                      <IonText color="medium">
                        <small>{dia.duracionEstimada} min</small>
                      </IonText>
                    </div>
                  </IonItem>

                  {/* Ejercicios del día */}
                  <div slot="content" style={{ background: "#f4f5f8", padding: "8px 12px" }}>
                    {dia.ejercicios.length === 0 ? (
                      <IonText color="medium">
                        <p style={{ padding: "8px 0" }}>Día de descanso completo. ¡Recupera!</p>
                      </IonText>
                    ) : (
                      dia.ejercicios.map((ej, ejIdx) => (
                        <ExerciseCard key={ejIdx} ejercicio={ej} />
                      ))
                    )}
                  </div>
                </IonAccordion>
              ))}
            </IonAccordionGroup>

            <div style={{ height: 32 }} />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

// ─── Subcomponente: Tarjeta de ejercicio ─────────────────
const ExerciseCard: React.FC<{ ejercicio: Exercise }> = ({ ejercicio }) => (
  <IonCard style={{ borderRadius: 10, margin: "8px 0" }}>
    <IonCardContent style={{ padding: "10px 14px" }}>
      <IonGrid style={{ padding: 0 }}>
        <IonRow className="ion-align-items-center">
          <IonCol size="1">
            <span style={{ fontSize: "1.4rem" }}>{ejercicio.icono}</span>
          </IonCol>
          <IonCol size="11">
            <IonText color="dark">
              <strong style={{ fontSize: "0.95rem" }}>{ejercicio.nombre}</strong>
            </IonText>
            <br />
            <IonText color="medium">
              <small>{ejercicio.descripcion}</small>
            </IonText>
            <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <IonChip
                color={categoriaColor[ejercicio.categoria] || "primary"}
                style={{ height: 22, fontSize: "0.7rem" }}
              >
                {ejercicio.categoria}
              </IonChip>
              <IonChip
                color={intensidadColor[ejercicio.intensidad]}
                style={{ height: 22, fontSize: "0.7rem" }}
              >
                {ejercicio.intensidad}
              </IonChip>
              <IonChip
                color="dark"
                outline
                style={{ height: 22, fontSize: "0.7rem" }}
              >
                {ejercicio.series} series · {ejercicio.repeticiones}
              </IonChip>
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonCardContent>
  </IonCard>
);

export default Tab2Plan;

// ============================================================
//  Tab1_Profile.tsx — Perfil y Evaluación del Jugador
//  Formulario inteligente con generación automática de perfil
// ============================================================

import React, { useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonButton, IonChip, IonIcon, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonText, IonBadge, IonGrid,
  IonRow, IonCol, IonTextarea, IonToast, IonProgressBar,
} from "@ionic/react";
import { personOutline, checkmarkCircle, trophyOutline, barbell } from "ionicons/icons";
import { usePlayer } from "../context/PlayerContext";
import { generateAutoProfile, PlayerProfile, Position, Level } from "../logic/trainingAI";

// Opciones disponibles para fortalezas y debilidades
const HABILIDADES = ["tiro", "manejo", "defensa", "rebote", "pase", "físico", "velocidad", "táctica"];

const Tab1Profile: React.FC = () => {
  // ─── Estado local del formulario ───────────────────────
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState<number>(16);
  const [altura, setAltura] = useState<number>(170);
  const [posicion, setPosicion] = useState<Position>("base");
  const [nivel, setNivel] = useState<Level>("principiante");
  const [fortalezas, setFortalezas] = useState<string[]>([]);
  const [debilidades, setDebilidades] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Estado global
  const { state, dispatch } = usePlayer();

  // ─── Toggle de chip (fortaleza/debilidad) ─────────────
  const toggleHabilidad = (
    habilidad: string,
    lista: string[],
    setLista: (v: string[]) => void,
    otraLista: string[]
  ) => {
    // Evitar que la misma habilidad esté en ambas listas
    if (otraLista.includes(habilidad)) {
      setToastMsg(`"${habilidad}" ya está en la otra lista. Quítalo primero.`);
      setShowToast(true);
      return;
    }
    setLista(
      lista.includes(habilidad)
        ? lista.filter((h) => h !== habilidad)
        : [...lista, habilidad]
    );
  };

  // ─── Validación y guardado del perfil ─────────────────
  const handleGuardar = () => {
    if (!nombre.trim()) {
      setToastMsg("Por favor ingresa tu nombre.");
      setShowToast(true);
      return;
    }
    if (fortalezas.length === 0 || debilidades.length === 0) {
      setToastMsg("Selecciona al menos 1 fortaleza y 1 debilidad.");
      setShowToast(true);
      return;
    }

    const perfil: PlayerProfile = {
      nombre: nombre.trim(),
      edad,
      altura,
      posicion,
      nivel,
      fortalezas,
      debilidades,
    };

    // Generar descripción automática con el motor AI
    const descripcion = generateAutoProfile(perfil);

    dispatch({ type: "SET_PERFIL", payload: { perfil, descripcion } });
    setToastMsg("✅ Perfil guardado. Ve al Tab 2 para ver tu plan.");
    setShowToast(true);
  };

  // ─── Colores por nivel ────────────────────────────────
  const nivelColor: Record<Level, string> = {
    principiante: "success",
    intermedio: "warning",
    avanzado: "danger",
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="dark">
          <IonTitle>
            <IonIcon icon={personOutline} style={{ marginRight: 8 }} />
            Perfil del Jugador
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" color="light">
        {/* ── Header motivacional ── */}
        <IonCard color="dark" style={{ borderRadius: 16, marginBottom: 16 }}>
          <IonCardContent>
            <IonText color="warning">
              <h2 style={{ margin: 0 }}>🏀 Training Planner AI</h2>
            </IonText>
            <IonText color="light">
              <p style={{ margin: "4px 0 0" }}>
                Completa tu perfil para que el entrenador virtual genere tu plan personalizado.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* ── Sección: Datos básicos ── */}
        <IonCard style={{ borderRadius: 12 }}>
          <IonCardHeader>
            <IonCardTitle>📋 Datos Personales</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="inset">
              <IonLabel position="stacked">Nombre completo</IonLabel>
              <IonInput
                value={nombre}
                onIonInput={(e) => setNombre(e.detail.value!)}
                placeholder="Ej: Carlos Mendoza"
                clearInput
              />
            </IonItem>

            <IonGrid style={{ padding: 0 }}>
              <IonRow>
                <IonCol size="6">
                  <IonItem lines="inset">
                    <IonLabel position="stacked">Edad (años)</IonLabel>
                    <IonInput
                      type="number"
                      value={edad}
                      onIonInput={(e) => setEdad(parseInt(e.detail.value!) || 16)}
                      min={10}
                      max={40}
                    />
                  </IonItem>
                </IonCol>
                <IonCol size="6">
                  <IonItem lines="inset">
                    <IonLabel position="stacked">Altura (cm)</IonLabel>
                    <IonInput
                      type="number"
                      value={altura}
                      onIonInput={(e) => setAltura(parseInt(e.detail.value!) || 170)}
                      min={140}
                      max={230}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* ── Sección: Posición y Nivel ── */}
        <IonCard style={{ borderRadius: 12 }}>
          <IonCardHeader>
            <IonCardTitle>🏟️ Posición y Nivel</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="inset">
              <IonLabel>Posición en cancha</IonLabel>
              <IonSelect
                value={posicion}
                onIonChange={(e) => setPosicion(e.detail.value)}
                interface="action-sheet"
              >
                <IonSelectOption value="base">🎯 Base (Point Guard)</IonSelectOption>
                <IonSelectOption value="escolta">🏹 Escolta (Shooting Guard)</IonSelectOption>
                <IonSelectOption value="alero">🌟 Alero (Small Forward)</IonSelectOption>
                <IonSelectOption value="ala-pivot">💪 Ala-Pívot (Power Forward)</IonSelectOption>
                <IonSelectOption value="pivot">🏋️ Pívot (Center)</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem lines="inset">
              <IonLabel>Nivel de juego</IonLabel>
              <IonSelect
                value={nivel}
                onIonChange={(e) => setNivel(e.detail.value)}
                interface="action-sheet"
              >
                <IonSelectOption value="principiante">🟢 Principiante</IonSelectOption>
                <IonSelectOption value="intermedio">🟡 Intermedio</IonSelectOption>
                <IonSelectOption value="avanzado">🔴 Avanzado</IonSelectOption>
              </IonSelect>
            </IonItem>

            {/* Indicador visual de nivel */}
            <div style={{ padding: "8px 0" }}>
              <IonText color="medium">
                <small>Intensidad del plan:</small>
              </IonText>
              <IonProgressBar
                value={nivel === "principiante" ? 0.33 : nivel === "intermedio" ? 0.66 : 1}
                color={nivelColor[nivel] as any}
                style={{ borderRadius: 8, marginTop: 4 }}
              />
            </div>
          </IonCardContent>
        </IonCard>

        {/* ── Sección: Fortalezas ── */}
        <IonCard style={{ borderRadius: 12 }}>
          <IonCardHeader>
            <IonCardTitle>
              💚 Fortalezas{" "}
              <IonBadge color="success">{fortalezas.length}</IonBadge>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              <small>Toca para seleccionar tus puntos fuertes</small>
            </IonText>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {HABILIDADES.map((h) => (
                <IonChip
                  key={h}
                  color={fortalezas.includes(h) ? "success" : "medium"}
                  outline={!fortalezas.includes(h)}
                  onClick={() => toggleHabilidad(h, fortalezas, setFortalezas, debilidades)}
                >
                  {fortalezas.includes(h) && <IonIcon icon={checkmarkCircle} />}
                  <IonLabel>{h}</IonLabel>
                </IonChip>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* ── Sección: Debilidades ── */}
        <IonCard style={{ borderRadius: 12 }}>
          <IonCardHeader>
            <IonCardTitle>
              🔴 Áreas de Mejora{" "}
              <IonBadge color="danger">{debilidades.length}</IonBadge>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              <small>Sé honesto: identificar debilidades acelera el progreso</small>
            </IonText>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {HABILIDADES.map((h) => (
                <IonChip
                  key={h}
                  color={debilidades.includes(h) ? "danger" : "medium"}
                  outline={!debilidades.includes(h)}
                  onClick={() => toggleHabilidad(h, debilidades, setDebilidades, fortalezas)}
                >
                  {debilidades.includes(h) && <IonIcon icon={checkmarkCircle} />}
                  <IonLabel>{h}</IonLabel>
                </IonChip>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* ── Botón de guardado ── */}
        <IonButton
          expand="block"
          color="warning"
          style={{ margin: "16px 0", borderRadius: 12, fontWeight: "bold" }}
          onClick={handleGuardar}
        >
          <IonIcon icon={trophyOutline} slot="start" />
          Generar Mi Perfil AI
        </IonButton>

        {/* ── Mostrar perfil generado ── */}
        {state.perfilDescripcion ? (
          <IonCard color="dark" style={{ borderRadius: 12, marginBottom: 32 }}>
            <IonCardHeader>
              <IonCardTitle>
                <IonText color="warning">🤖 Análisis AI de tu Perfil</IonText>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="light">
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  {state.perfilDescripcion}
                </pre>
              </IonText>
            </IonCardContent>
          </IonCard>
        ) : null}

        <IonToast
          isOpen={showToast}
          message={toastMsg}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1Profile;

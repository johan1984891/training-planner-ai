// ============================================================
//  PlayerContext.tsx — Estado Global con React Context + useReducer
//  Centraliza todos los datos del jugador, plan y progreso
// ============================================================

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  PlayerProfile,
  WeeklyPlan,
  VideoFeedback,
  ProgressEntry,
} from "../logic/trainingAI";

// ─── FORMA DEL ESTADO GLOBAL ───────────────────────────────
interface AppState {
  perfil: PlayerProfile | null;
  perfilDescripcion: string;
  planSemanal: WeeklyPlan | null;
  videoFeedback: VideoFeedback | null;
  progreso: ProgressEntry[];
  tabActiva: string;
}

const initialState: AppState = {
  perfil: null,
  perfilDescripcion: "",
  planSemanal: null,
  videoFeedback: null,
  progreso: [],
  tabActiva: "tab1",
};

// ─── ACCIONES DEL REDUCER ──────────────────────────────────
type Action =
  | { type: "SET_PERFIL"; payload: { perfil: PlayerProfile; descripcion: string } }
  | { type: "SET_PLAN"; payload: WeeklyPlan }
  | { type: "SET_FEEDBACK"; payload: VideoFeedback }
  | { type: "ADD_PROGRESO"; payload: ProgressEntry }
  | { type: "RESET_FEEDBACK" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PERFIL":
      return {
        ...state,
        perfil: action.payload.perfil,
        perfilDescripcion: action.payload.descripcion,
        // Al cambiar perfil, resetear plan anterior
        planSemanal: null,
      };
    case "SET_PLAN":
      return { ...state, planSemanal: action.payload };
    case "SET_FEEDBACK":
      return { ...state, videoFeedback: action.payload };
    case "ADD_PROGRESO":
      return { ...state, progreso: [...state.progreso, action.payload] };
    case "RESET_FEEDBACK":
      return { ...state, videoFeedback: null };
    default:
      return state;
  }
}

// ─── CONTEXTO Y PROVIDER ──────────────────────────────────
interface PlayerContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <PlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
}

// ─── HOOK PERSONALIZADO ───────────────────────────────────
export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer debe usarse dentro de PlayerProvider");
  return ctx;
}

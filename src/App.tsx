// ============================================================
//  App.tsx — Punto de entrada principal de Training Planner AI
//  Configura IonTabs, rutas y Provider global
// ============================================================

import React from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  personOutline,
  calendarOutline,
  videocamOutline,
} from "ionicons/icons";

/* Ionic + Ionic Dark Theme */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";

/* Páginas */
import Tab1Profile from "./pages/Tab1";
import Tab2Plan from "./pages/Tab2";
import Tab3Video from "./pages/Tab3";

/* Estado global */
import { PlayerProvider } from "./context/PlayerContext";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    {/* PlayerProvider envuelve TODA la app: estado accesible desde cualquier tab */}
    <PlayerProvider>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            {/* Rutas de cada tab */}
            <Route exact path="/tab1" component={Tab1Profile} />
            <Route exact path="/tab2" component={Tab2Plan} />
            <Route exact path="/tab3" component={Tab3Video} />
            {/* Ruta por defecto → Tab 1 */}
            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>
          </IonRouterOutlet>

          {/* Barra de tabs inferior */}
          <IonTabBar slot="bottom" color="dark">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={personOutline} />
              <IonLabel>Perfil</IonLabel>
            </IonTabButton>

            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon aria-hidden="true" icon={calendarOutline} />
              <IonLabel>Mi Plan</IonLabel>
            </IonTabButton>

            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon aria-hidden="true" icon={videocamOutline} />
              <IonLabel>Video</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </PlayerProvider>
  </IonApp>
);

export default App;

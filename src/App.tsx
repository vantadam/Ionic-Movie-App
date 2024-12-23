import React, { useEffect, useState } from 'react';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, person, cloudUpload, settings, peopleOutline, people } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UploadCSVFromLocal from './pages/Upload';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import Users from './pages/Users';

setupIonicReact();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email); // Store the user email
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Placeholder while checking auth state
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            {isAuthenticated ? (
              <>
                <Route path="/home" component={Home} exact />
                <Route path="/profile" component={Profile} exact />
                {userEmail === 'admin@admin.com' ? (
                  <Route path="/upload" component={UploadCSVFromLocal} exact />
                ) : (
                  <Route path="/upload" render={() => <Redirect to="/home" />} />
                )}
                   {userEmail === 'admin@admin.com' ? (
                  <Route path="/users" component={Users} exact />
                ) : (
                  <Route path="/users" render={() => <Redirect to="/home" />} />
                )}
                <Route exact path="/" render={() => <Redirect to="/home" />} />
              </>
            ) : (
              <>
                <Route path="/login" component={Login} exact />
                <Route path="*" render={() => <Redirect to="/login" />} />
              </>
            )}
          </IonRouterOutlet>
          {isAuthenticated && (
            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                <IonIcon icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>
             
              {userEmail === 'admin@admin.com' ? (
                <IonTabButton tab="upload" href="/upload">
                  <IonIcon icon={cloudUpload} />
                  <IonLabel>Upload</IonLabel>
                </IonTabButton>
              ) : (
                <IonTabButton tab="profile" href="/profile">
                  <IonIcon icon={person} />
                  <IonLabel>Profile</IonLabel>
                </IonTabButton>
              )}
               {userEmail === 'admin@admin.com' ? (
                <IonTabButton tab="users" href="/users">
                  <IonIcon icon={people} />
                  <IonLabel>Users</IonLabel>
                </IonTabButton>
              ) : (
                <IonTabButton tab="profile" href="/profile">
                  <IonIcon icon={people} />
                  <IonLabel>Match</IonLabel>
                </IonTabButton>
              )}

              <IonTabButton
                tab="logout"
                onClick={() => {
                  auth.signOut();
                  window.location.reload();
                }}
              >
                <IonIcon icon={settings} />
                <IonLabel>Sign Out</IonLabel>
              </IonTabButton>
            </IonTabBar>
          )}
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

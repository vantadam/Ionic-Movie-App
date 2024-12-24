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
import { home, person, cloudUpload, settings, people } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UploadCSVFromLocal from './pages/Upload';
import Users from './pages/Users';
import Match from './pages/Match';
import Activate from './pages/Activate';

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

setupIonicReact();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);
  const db = getFirestore();

  const fetchUserData = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userData = await fetchUserData(user.uid);
          if (userData) {
            setCurrentUser({ ...user, ...userData });
            setIsAuthenticated(true);
            setIsActive(userData.isActive !== false);
          }
        } catch (error) {
          console.error('Error setting user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            {isAuthenticated ? (
              isActive ? (
                <>
                  <Route path="/home" component={Home} exact />
                  <Route path="/profile" component={Profile} exact />
                  <Route path="/match" component={Match} exact />
                  {currentUser?.role === 'admin' ? (
                    <>
                      <Route path="/upload" component={UploadCSVFromLocal} exact />
                      <Route path="/users" component={Users} exact />
                    </>
                  ) : (
                    <>
                      <Route path="/upload" render={() => <Redirect to="/home" />} />
                      <Route path="/users" render={() => <Redirect to="/home" />} />
                    </>
                  )}
                  <Route exact path="/" render={() => <Redirect to="/home" />} />
                  <Route path="*" render={() => <Redirect to="/home" />} />
                </>
              ) : (
                <>
                  <Route path="/activate" component={Activate} exact />
                  <Route path="*" render={() => <Redirect to="/activate" />} />
                </>
              )
            ) : (
              <>
                <Route path="/login" component={Login} exact />
                <Route path="*" render={() => <Redirect to="/login" />} />
              </>
            )}
          </IonRouterOutlet>
          {isAuthenticated && isActive && (
            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                <IonIcon icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>
              {currentUser?.role === 'admin' ? (
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
              {currentUser?.role === 'admin' ? (
                <IonTabButton tab="users" href="/users">
                  <IonIcon icon={people} />
                  <IonLabel>Users</IonLabel>
                </IonTabButton>
              ) : (
                <IonTabButton tab="match" href="/match">
                  <IonIcon icon={people} />
                  <IonLabel>Match</IonLabel>
                </IonTabButton>
              )}
              <IonTabButton
                tab="logout"
                onClick={() => {
                  signOut(auth);
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

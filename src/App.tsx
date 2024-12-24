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
import Activate from './pages/Activate'; // Add this page for activation

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

setupIonicReact();

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);
  const db = getFirestore();

  // Function to fetch both user role and isActive status
  const fetchUserData = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData; // Return all user data (role and isActive)
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
          const userData = await fetchUserData(user.uid); // Fetch user role and isActive
          if (userData) {
            setCurrentUser({ ...user, ...userData }); // Set user data
            setIsAuthenticated(true); // Set authentication to true

            // Check if the account is active
            if (userData.isActive === false) {
              setIsActive(false); // Set isActive to false if the user is inactive
            } else {
              setIsActive(true); // Ensure the user is active
            }
          }
        } catch (error) {
          console.error('Error setting user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false); // No user logged in
      }
      setLoading(false); // Stop loading once auth state is checked
    });

    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return <div>Loading...</div>; // Placeholder while checking auth state
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            {isAuthenticated ? (
              // Check if the user is active, show activation page if not
              isActive ? (
                <>
                  <Route path="/home" component={Home} exact />
                  <Route path="/profile" component={Profile} exact />
                  <Route path="/match" component={Match} exact />
                  {currentUser?.role === 'admin' ? (
                    <Route path="/upload" component={UploadCSVFromLocal} exact />
                  ) : (
                    <Route path="/upload" render={() => <Redirect to="/home" />} />
                  )}
                  {currentUser?.role === 'admin' ? (
                    <Route path="/users" component={Users} exact />
                  ) : (
                    <Route path="/users" render={() => <Redirect to="/home" />} />
                  )}
                  <Route exact path="/" render={() => <Redirect to="/home" />} />
                </>
              ) : (
                // If the user is not active, show the Activate page
                <Route path="/activate" component={Activate} exact />
              )
            ) : (
              <>
                {/* Anyone can access the login page */}
                <Route path="/login" component={Login} exact />
                {/* If user is not authenticated, redirect to login */}
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

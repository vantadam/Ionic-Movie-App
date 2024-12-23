import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Track if the component is still mounted

    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          if (isMounted) {
            setError('User not logged in.');
            setLoading(false);
          }
          return;
        }

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && isMounted) {
          const data = docSnap.data();
          setName(data.name || 'N/A');
          setFavorites(data.favorites || []);
        } else if (isMounted) {
          setError('User data not found.');
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch user data.');
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false; // Cleanup function to prevent updates after unmount
    };
  }, []);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {loading ? (
          <IonSpinner />
        ) : error ? (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        ) : (
          <>
            <h1>Profile</h1>
            <IonItem>
              <IonLabel position="floating">Name</IonLabel>
              <IonInput value={name} readonly />
            </IonItem>

            <IonList>
              <IonText>
                <h2>Favorites</h2>
              </IonText>
              {favorites.length === 0 ? (
                <IonText>No favorites yet.</IonText>
              ) : (
                favorites.map((movie, index) => (
                  <IonItem key={index}>{movie}</IonItem>
                ))
              )}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Profile;

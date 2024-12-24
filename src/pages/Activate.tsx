import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';

const Activate: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account Inactive</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h2>Your account is not active. Please activate your account to continue.</h2>
        <IonButton onClick={() => {
                          signOut(auth);
                          window.location.reload();
                        }}>Go to Login</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Activate;

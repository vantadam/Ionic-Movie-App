import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonItem, IonText, IonLoading } from '@ionic/react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [username, setUsername] = useState('');
  const [isNewUser, setIsNewUser] = useState(false); // Toggle between login and signup
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  // Handle Signup
  const handleSignup = async () => {
    if (!email || !password || !username || !birthdate) {
      setErrorMessage('Please enter email, password, username, and birthdate.');
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: username,
        email: user.email,
        birthdate: birthdate,
        image: '',
        isActive: true,
        favorites: [],
      });

      setIsLoading(false);
      history.push('/home');
    } catch (error: any) {
      setErrorMessage(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      history.push('/home');
    } catch (error: any) {
      setErrorMessage(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h1>{isNewUser ? 'Sign Up' : 'Login'}</h1>
        <IonItem>
          <IonInput 
            placeholder="Email" 
            value={email} 
            onIonChange={(e) => setEmail(e.detail.value!)} 
            type="email" 
          />
        </IonItem>
        <IonItem>
          <IonInput 
            placeholder="Password" 
            value={password} 
            onIonChange={(e) => setPassword(e.detail.value!)} 
            type="password" 
          />
        </IonItem>
        
        {isNewUser && (
          <>
            <IonItem>
              <IonInput 
                placeholder="Username" 
                value={username} 
                onIonChange={(e) => setUsername(e.detail.value!)} 
              />
            </IonItem>
            <IonItem>
              <IonInput 
                placeholder="Birthdate (YYYY-MM-DD)" 
                value={birthdate} 
                onIonChange={(e) => setBirthdate(e.detail.value!)} 
                type="date" 
              />
            </IonItem>
          </>
        )}

        <IonButton expand="block" onClick={isNewUser ? handleSignup : handleLogin}>
          {isNewUser ? 'Sign Up' : 'Login'}
        </IonButton>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        
        <IonText>
          <p onClick={() => setIsNewUser(!isNewUser)}>
            {isNewUser ? 'Already have an account? Login' : 'New user? Sign Up'}
          </p>
        </IonText>

        <IonLoading isOpen={isLoading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;

import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
} from '@ionic/react';
import { getFirestore, collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const db = getFirestore();

  // Fetch users from Firestore in real-time
  useEffect(() => {
    const usersCollection = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [db]);

  // Function to deactivate a user
  const deactivateUser = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { isActive: false }); // Set the 'active' field to false
      alert('User deactivated successfully.');
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Failed to deactivate user. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Users</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {users.map((user) => (
            <IonItem key={user.id}>
              <IonLabel>
                <h2>{user.name || 'No Name'}</h2>
                <p>{user.email || 'No Email'}</p>
                <p>Status: {user.isActive ? 'Active' : 'Deactivated'}</p>
              </IonLabel>
              {user.isActive && (
                <IonButton
                  color="danger"
                  onClick={() => deactivateUser(user.id)}
                >
                  Deactivate
                </IonButton>
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Users;

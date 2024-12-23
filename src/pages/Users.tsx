import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem } from '@ionic/react';

const Users: React.FC = () => {
    const users = ['User1', 'User2', 'User3']; // Example user data

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Users</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    {users.map((user, index) => (
                        <IonItem key={index}>{user}</IonItem>
                    ))}
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default Users;
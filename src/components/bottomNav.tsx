
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { home, person, cloudUpload } from 'ionicons/icons';

interface BottomNavProps {
  userEmail: string | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ userEmail }) => {
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/home">
        <IonIcon icon={home} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/profile">
        <IonIcon icon={person} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
      {userEmail === 'admin@admin.com' && (
        <IonTabButton tab="upload" href="/upload">
          <IonIcon icon={cloudUpload} />
          <IonLabel>Upload</IonLabel>
        </IonTabButton>
      )}
    </IonTabBar>
  );
};

export default BottomNav;

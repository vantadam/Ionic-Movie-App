import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs } from "firebase/firestore";

const db = getFirestore();

const Match: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const [moviesMap, setMoviesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();

  // Fetch movies and build a map
  const fetchMovies = async () => {
    try {
      console.log("Fetching movies...");
      const moviesCollectionRef = collection(db, "movies");
      const querySnapshot = await getDocs(moviesCollectionRef);
      const map: Record<string, string> = {};

      querySnapshot.forEach((doc) => {
        const movie = doc.data();
        map[movie.movieId] = movie.title;
      });

      console.log("Movies map:", map);
      setMoviesMap(map);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to fetch movies.");
    }
  };

  const fetchCurrentUserFavorites = async (userId: string) => {
    try {
      console.log(`Fetching favorites for user ID: ${userId}`);
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log("User document data:", userDoc.data());
        setUserFavorites(userDoc.data().favorites || []);
      } else {
        console.error("User data not found.");
        setError("User data not found.");
      }
    } catch (err) {
      console.error("Error fetching current user favorites:", err);
      setError("Failed to fetch user data.");
    }
  };

  const calculateMatchPercentage = (userFavs: string[]) => {
    console.log("Calculating match percentage...");
    const intersection = userFavs.filter((movieId) => userFavorites.includes(movieId));
    console.log("Matched movies:", intersection);
    return (intersection.length / userFavorites.length) * 100;
  };

  const fetchMatchingUsers = async () => {
    try {
      console.log("Fetching all users to find matches...");
      const usersCollectionRef = collection(db, "users");
      const querySnapshot = await getDocs(usersCollectionRef);
      const matched: any[] = [];

      querySnapshot.forEach((doc) => {
        const user = doc.data();
        console.log(`Checking user: ${doc.id}`, user);
        if (user.favorites && doc.id !== currentUser?.uid) {
          const matchPercentage = calculateMatchPercentage(user.favorites);
          console.log(`User: ${doc.id} Match Percentage: ${matchPercentage}`);
          if (matchPercentage >= 70) {
            matched.push({
              id: doc.id,
              name: user.name || "Unknown User",
              matchPercentage,
              favorites: user.favorites,
            });
          }
        }
      });

      console.log("Matched users:", matched);
      setMatchedUsers(matched);
    } catch (err) {
      console.error("Error fetching matching users:", err);
      setError("Failed to fetch matching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state observer...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Current user:", user);
        setCurrentUser(user);
        fetchCurrentUserFavorites(user.uid);
        fetchMovies(); // Fetch movies once on load
      } else {
        console.log("No user is currently logged in.");
        setCurrentUser(null);
        setUserFavorites([]);
        setMatchedUsers([]);
      }
    });

    return () => {
      console.log("Cleaning up auth observer...");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userFavorites.length > 0) {
      console.log("User favorites updated, fetching matches...");
      fetchMatchingUsers();
    } else {
      console.log("No user favorites found, skipping match fetch.");
      setLoading(false);
    }
  }, [userFavorites]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Match</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h2>Users with similar taste</h2>
        {loading ? (
          <IonSpinner />
        ) : error ? (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        ) : matchedUsers.length === 0 ? (
          <IonText>No matches found.</IonText>
        ) : (
          <div style={{ display: "flex", overflowX: "auto", padding: "10px" }}>
            {matchedUsers.map((user) => (
              <IonCard key={user.id} style={{ width: "200px", marginRight: "10px" }}>
                <IonCardHeader>
                  <IonCardTitle>{user.name}</IonCardTitle>
                  <p>Match: {user.matchPercentage.toFixed(2)}%</p>
                </IonCardHeader>
                <IonCardContent>
                  <p>Favourites:</p>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {user.favorites.map((movieId: string) => (
                      <IonText key={movieId}>
                        {moviesMap[movieId] || "Unknown Movie"}
                      </IonText>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Match;

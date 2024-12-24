import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

const MOVIES_PER_PAGE = 20;

const Home = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [likedMovies, setLikedMovies] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const db = getFirestore();
  const auth = getAuth();
  const moviesCollectionRef = collection(db, "movies");

  // Fetch movies
  const fetchMovies = async (isLoadMore = false) => {
    setIsLoading(true);

    try {
      let moviesQuery;

      if (isLoadMore) {
        moviesQuery = query(
          moviesCollectionRef,
          orderBy("title"),
          startAfter(lastVisible),
          limit(MOVIES_PER_PAGE)
        );
      } else {
        moviesQuery = query(moviesCollectionRef, orderBy("title"), limit(MOVIES_PER_PAGE));
      }

      const querySnapshot = await getDocs(moviesQuery);
      const fetchedMovies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMovies((prevMovies) =>
        isLoadMore ? [...prevMovies, ...fetchedMovies] : fetchedMovies
      );
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete movie
  const deleteMovie = async (movieId: string) => {
    try {
      const movieDocRef = doc(db, "movies", movieId);
      await deleteDoc(movieDocRef);  // Delete the movie from Firestore
      setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));  // Remove from the local state
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  // Search movies
  const searchMovies = async () => {
    setIsLoading(true);

    try {
      let searchQueryRef = query(moviesCollectionRef);

      if (searchQuery) {
        searchQueryRef = query(
          moviesCollectionRef,
          where("title", ">=", searchQuery),
          where("title", "<=", searchQuery + "\uf8ff")
        );
      }

      if (yearFilter) {
        searchQueryRef = query(searchQueryRef, where("year", "==", yearFilter));
      }

      if (genreFilter) {
        searchQueryRef = query(
          searchQueryRef,
          where("genres", "array-contains", genreFilter)
        );
      }

      const querySnapshot = await getDocs(searchQueryRef);
      const searchedMovies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMovies(searchedMovies);
    } catch (error) {
      console.error("Error searching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle like/unlike movie
  const toggleLikeMovie = async (movieId: string) => {
    if (!currentUser) {
      alert("Please log in to like movies.");
      return;
    }

    const userDocRef = doc(db, "users", currentUser.uid);

    try {
      if (likedMovies.includes(movieId)) {
        // Unlike the movie
        await updateDoc(userDocRef, {
          favorites: arrayRemove(movieId),
        });
        setLikedMovies((prev) => prev.filter((id) => id !== movieId));
      } else {
        // Like the movie
        await updateDoc(userDocRef, {
          favorites: arrayUnion(movieId),
        });
        setLikedMovies((prev) => [...prev, movieId]);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  // Fetch liked movies for the current user
  const fetchLikedMovies = async (userId: string) => {
    const userDocRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      setLikedMovies(userData.favorites || []);
    }
  };

  // Fetch user role
const fetchUserRole = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || null; // Return the role or null if not found
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
  return null;
};


  // Handle authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await fetchUserRole(user.uid); // Fetch the user's role
        setCurrentUser({ ...user, role }); // Update currentUser with role
        fetchLikedMovies(user.uid); // Fetch liked movies on login
      } else {
        setCurrentUser(null);
        setLikedMovies([]); // Clear likes when logged out
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const handleScroll = (e: any) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;

    if (bottom && !isLoading) {
      fetchMovies(true);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const availableGenres = Array.from(
    new Set(movies.flatMap((movie) => movie.genres))
  );

  return (
    <div onScroll={handleScroll} style={{ height: "80vh", overflowY: "scroll" }}>
      <IonItem>
        <IonLabel position="floating">Search by Title</IonLabel>
        <IonInput
          value={searchQuery}
          onIonChange={(e) => setSearchQuery(e.detail.value!)}
        />
      </IonItem>
      <IonItem>
        <IonLabel>Filter by Year</IonLabel>
        <IonSelect
          value={yearFilter}
          onIonChange={(e) => setYearFilter(e.detail.value!)}
        >
          <IonSelectOption value="">All</IonSelectOption>
          {Array.from(new Set(movies.map((movie) => movie.year)))
            .sort()
            .map((year) => (
              <IonSelectOption key={year} value={year}>
                {year}
              </IonSelectOption>
            ))}
        </IonSelect>
      </IonItem>
      <IonItem>
        <IonLabel>Filter by Genre</IonLabel>
        <IonSelect
          value={genreFilter}
          onIonChange={(e) => setGenreFilter(e.detail.value!)}
        >
          <IonSelectOption value="">All</IonSelectOption>
          {availableGenres.map((genre) => (
            <IonSelectOption key={genre} value={genre}>
              {genre}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
      <IonButton onClick={searchMovies} disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </IonButton>
      <IonList>
        {movies.map((movie) => (
          <IonItem key={movie.id}>
            <div>
              <h3>{movie.title}</h3>
              <p>Genres: {movie.genres.join(", ")}</p>
              <p>Year: {movie.year}</p>
              {currentUser?.role === "admin" ? (
                <IonButton
                  color="danger"
                  onClick={() => deleteMovie(movie.id)} // Delete functionality
                >
                  Delete
                </IonButton>
              ) : (
                <IonButton
                  color={likedMovies.includes(movie.id) ? "danger" : "primary"}
                  onClick={() => toggleLikeMovie(movie.id)}
                >
                  {likedMovies.includes(movie.id) ? "Unlike" : "Like"}
                </IonButton>
              )}
            </div>
          </IonItem>
        ))}
      </IonList>
      {isLoading && <p>Loading...</p>}
    </div>
  );
};

export default Home;

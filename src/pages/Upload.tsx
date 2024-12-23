import { doc, getFirestore, collection, setDoc, writeBatch } from "firebase/firestore";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Import UUID for random ID generation
import Papa from "papaparse";
import { IonButton, IonInput, IonItem, IonLabel } from "@ionic/react";

const BATCH_SIZE = 500;

const Upload = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // State for new movie form
  const [newMovie, setNewMovie] = useState({
    title: "",
    genres: "",
    year: "",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    const db = getFirestore();
    const moviesCollectionRef = collection(db, "movies");

    try {
      Papa.parse(selectedFile, {
        complete: async (result) => {
          console.log("Parsed CSV data:", result.data);
          const moviesData = result.data;

          let batch = writeBatch(db);
          let batchCount = 0;

          for (let i = 0; i < moviesData.length; i++) {
            const movieData = moviesData[i];

            if (movieData && movieData.length >= 3) {
              const movieDoc = {
                movieId: uuidv4(), // Generate a random movieId
                title: movieData[0],
                genres: movieData[1].split("|"),
                year: movieData[2],
              };

              console.log("Adding movie to batch:", movieDoc);

              const movieDocRef = doc(moviesCollectionRef, movieDoc.movieId);
              batch.set(movieDocRef, movieDoc);
              batchCount++;

              if (batchCount === BATCH_SIZE) {
                await batch.commit();
                console.log(`Committed batch of ${BATCH_SIZE} writes.`);
                batch = writeBatch(db);
                batchCount = 0;
              }
            }
          }

          if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed final batch of ${batchCount} writes.`);
          }

          setIsLoading(false);
          setErrorMessage("All movies uploaded successfully!");
          console.log("All movies uploaded successfully!");
        },
        error: (error) => {
          setIsLoading(false);
          setErrorMessage("Error parsing CSV file.");
          console.error("CSV parse error:", error);
        },
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Error during file upload.");
      console.error("File upload error:", error);
    }
  };

  const handleNewMovieUpload = async () => {
    const { title, genres, year } = newMovie;

    if (!title || !genres || !year) {
      setErrorMessage("Please fill in all the fields.");
      return;
    }

    setIsLoading(true);
    const db = getFirestore();
    const moviesCollectionRef = collection(db, "movies");

    const movieDoc = {
      movieId: uuidv4(), // Generate a random movieId
      title,
      genres: genres.split(",").map((genre) => genre.trim()), // Convert genres to an array, trimming spaces
      year,
    };

    try {
      const movieDocRef = doc(moviesCollectionRef, movieDoc.movieId);
      await setDoc(movieDocRef, movieDoc);

      setIsLoading(false);
      setErrorMessage("Movie added successfully!");
      console.log("Movie added successfully:", movieDoc);

      // Reset form fields
      setNewMovie({ title: "", genres: "", year: "" });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Error adding the movie.");
      console.error("Error adding movie:", error);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <IonButton onClick={handleFileUpload} disabled={isLoading || !selectedFile}>
        {isLoading ? "Uploading..." : "Upload Movies"}
      </IonButton>

      {errorMessage && <p>{errorMessage}</p>}

      <div>
        <h2>Add a New Movie</h2>
        <IonItem>
          <IonLabel position="floating">Title</IonLabel>
          <IonInput
            value={newMovie.title}
            onIonChange={(e) => setNewMovie({ ...newMovie, title: e.detail.value! })}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Genres (separated by ',')</IonLabel>
          <IonInput
            value={newMovie.genres}
            onIonChange={(e) => setNewMovie({ ...newMovie, genres: e.detail.value! })}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Year</IonLabel>
          <IonInput
            value={newMovie.year}
            onIonChange={(e) => setNewMovie({ ...newMovie, year: e.detail.value! })}
          />
        </IonItem>
        <IonButton onClick={handleNewMovieUpload} disabled={isLoading}>
          {isLoading ? "Uploading..." : "Add Movie"}
        </IonButton>
      </div>
    </div>
  );
};

export default Upload;

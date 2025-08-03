document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  
  const imageUploadInput = document.getElementById("img-upload-input");
  const previewContainer = document.getElementById("preview-container");
  //right column elements
  const resultsContainer = document.getElementById("result-container");
  const spinnerContainer = document.getElementById("spinner-container");
  //original preview image
  const searchLayoutContainer = document.getElementById("search-layout-container");
  //left column elements 
  const queryColumn = document.getElementById("query-column");
  const queryTitleContainer = document.getElementById("query-title-container");
  const queryImageContainer = document.getElementById("query-image-container");
  const newSearchButton = document.getElementById("new-search-button");

  //url of backend api endpoint
  const API_BASE_URL = "https://silque-backend-service-272670423626.us-east1.run.app";
  const searchApiUrl = `${API_BASE_URL}/search/`;

  //image preview logic
  let previewImageElement = null;
  imageUploadInput.addEventListener("change", () => {
    if (searchLayoutContainer.style.display === "flex") {
      resetUI();
    }
    const file = imageUploadInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImageElement = document.createElement("img");
        previewImageElement.src = e.target.result;
        previewImageElement.alt = "Image preview";
        previewImageElement.className = "preview-image";
        previewContainer.innerHTML = `<h3>Your Image:</h3>`;
        previewContainer.appendChild(previewImageElement.cloneNode(true));
      };
      reader.readAsDataURL(file);
    }
  });



  searchButton.addEventListener("click", () => {
    const file = imageUploadInput.files[0];
    if (!previewImageElement) {
      alert("Please select a file to preview first.");
      return;
    }

    //hide original preview image
    previewContainer.style.display = "none";

    //populate query column (left side):
    queryTitleContainer.innerHTML = `<h3>Your Image:</h3>`;
    queryImageContainer.innerHTML = "";
    // Move the original image
    queryImageContainer.appendChild(previewImageElement);
    //new two column layout
    searchLayoutContainer.style.display = "flex";

    //Show the spinner in the results column (right side):
    spinnerContainer.style.display = "block";
    resultsContainer.innerHTML = "";

    const formData = new FormData();
    formData.append("image_file", file);
    spinnerContainer.style.display = "block";
    resultsContainer.innerHTML = "";

    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        try {
          const response = await fetch(searchApiUrl, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Something went wrong");
          }

          const data = await response.json();
          displayResults(data.results);
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred: " + error.message);
        } finally {
          // 'finally' block ensures the spinner is always hidden
          // after the request finishes, whether it succeeded or failed.
          spinnerContainer.style.display = "none";
          newSearchButton.style.display = "block";
        }
      });
    });
  });

  newSearchButton.addEventListener("click", () => {
    resetUI();
  });

  function displayResults(results) {
    //purpose: take the results, loop over each result if it exists, and then disply it as an image
    if (!results || results.length === 0) {
      resultsContainer.innerHTML = "<p>No similar images found.</p>";
      return;
    }
    results.forEach((item) => {
      const imageurl = item.image_url
      const resultElement = document.createElement("div");
      resultElement.className = "result-item";

      const linkElement = document.createElement('a');
      linkElement.href = imageurl
      linkElement.target = "_blank"
      linkElement.rel = "noopener noreferrer";

      const imgElement = document.createElement('img')
      imgElement.src = imageurl
      imgElement.alt = "Similar style recommendation";

      const scoreElement = document.createElement("p");
      scoreElement.className = "similarity-score";
      scoreElement.textContent = `Similarity: ${(item.score * 100).toFixed(
        1
      )}%`;


      linkElement.appendChild(imgElement)
      
      resultElement.appendChild(linkElement)
      resultElement.appendChild(scoreElement);
      resultsContainer.appendChild(resultElement);
    });
  }

  function resetUI(){
    searchLayoutContainer.style.display = "none";
    newSearchButton.style.display = 'none';
    queryTitleContainer.innerHTML = "";
    queryImageContainer.innerHTML = "";
    resultsContainer.innerHTML = "";
    imageUploadInput.value = ""; 
    previewImageElement = null;
    previewContainer.style.display = "block";
    previewContainer.innerHTML = "";
  }
});

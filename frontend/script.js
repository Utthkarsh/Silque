document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  const spinnerContainer = document.getElementById("spinner-container");
  const imageUploadInput = document.getElementById("img-upload-input");
  const resultsContainer = document.getElementById("result-container");

  //url of backend api endpoint
  const API_BASE_URL = "https://silque-backend-service-272670423626.us-east1.run.app"
  const searchApiUrl = `${API_BASE_URL}/search/`
  searchButton.addEventListener("click", () => {
    const file = imageUploadInput.files[0];
    if (!file) {
      alert("Please select a file");
      return;
    }
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
        }
      });
    });
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

      linkElement.appendChild(imgElement)
      
      resultElement.appendChild(linkElement)
      resultsContainer.appendChild(resultElement);
    });
  }
});

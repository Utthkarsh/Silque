document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-button");
  const spinnerContainer = document.getElementById("spinner-container");
  const imageUploadInput = document.getElementById("img-upload-input");
  const resultsContainer = document.getElementById("result-container");

  //url of backend api endpoint
  const apiUrl = "http://127.0.0.1:8000/search/";
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
    setTimeout(async () => {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        //check for an error
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Something went wrong");
        }
        //success
        const data = await response.json();
        //  this hides the spinner after successful response
        spinnerContainer.style.display = "none";

        displayResults(data.results);
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred" + error.message);
        spinnerContainer.style.display = "none";
      }
    }, 0);
  });

  function displayResults(results) {
    //purpose: take the results, loop over each result if it exists, and then disply it as an image
    if (!results || results.length === 0) {
      resultsContainer.innerHTML = "<p>No similar images found.</p>";
      return;
    }
    const baseUrl = "http://127.0.0.1:8000/static/";
    results.forEach((item) => {
      const imageurl = baseUrl + item.image_path.replace("data", "");
      const resultElement = document.createElement("div");
      resultElement.className = "result-item";
      resultElement.innerHTML = `<img src="${imageurl}" alt="Similar style">`;
      resultsContainer.appendChild(resultElement);
    });
  }
});

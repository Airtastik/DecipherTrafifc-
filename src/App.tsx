import React, { useState, useRef, useEffect } from "react";
import "./App.css";

interface CarResult {
  make: string;
  model: string;
  year: number;
  class?: string;
  fuel_type?: string;
}

const App: React.FC = () => {
  // Media States
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);

  // Search States
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [searchMode, setSearchMode] = useState<"simple" | "advanced">("simple");
  const [advancedSearch, setAdvancedSearch] = useState<string>("");
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState<string>("");

  // Car API States
  const [makeInput, setMakeInput] = useState<string>("");
  const [modelInput, setModelInput] = useState<string>("");
  const [showMakeSuggestions, setShowMakeSuggestions] = useState<boolean>(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState<boolean>(false);
  const [isSearchingCars, setIsSearchingCars] = useState<boolean>(false);
  const [uniqueMakes, setUniqueMakes] = useState<string[]>([]);
  const [uniqueModels, setUniqueModels] = useState<string[]>([]);
  const [selectedMakeIndex, setSelectedMakeIndex] = useState<number>(-1);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(-1);

  // Analysis States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepsEndRef = useRef<HTMLDivElement>(null);
  const makeSuggestionsRef = useRef<HTMLDivElement>(null);
  const modelSuggestionsRef = useRef<HTMLDivElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const colorSelectRef = useRef<HTMLSelectElement>(null);
  const licensePlateInputRef = useRef<HTMLInputElement>(null);

  const colors = ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Yellow", "Orange", "Brown"];

  // Auto-scroll to latest step
  useEffect(() => {
    if (stepsEndRef.current && isLoading) {
      stepsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [analysisSteps, currentStep, isLoading]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (makeSuggestionsRef.current && !makeSuggestionsRef.current.contains(event.target as Node)) {
        setShowMakeSuggestions(false);
      }
      if (modelSuggestionsRef.current && !modelSuggestionsRef.current.contains(event.target as Node)) {
        setShowModelSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for makes when user types
  useEffect(() => {
    const searchMakes = async () => {
      if (makeInput.length < 1) {
        setUniqueMakes([]);
        setShowMakeSuggestions(false);
        return;
      }

      setIsSearchingCars(true);

      try {
        const params = new URLSearchParams();
        params.append("query", makeInput);

        const response = await fetch(`http://127.0.0.1:8000/api/cars/makes?${params}`);
        const data = await response.json();

        if (data.status === "success") {
          setUniqueMakes(data.makes);
          setShowMakeSuggestions(data.makes.length > 0);
        }
      } catch (error) {
        console.error("Error searching makes:", error);
      } finally {
        setIsSearchingCars(false);
      }
    };

    const debounceTimer = setTimeout(searchMakes, 300);
    return () => clearTimeout(debounceTimer);
  }, [makeInput]);

  // Search for models when user types (filtered by selected make if available)
  useEffect(() => {
    const searchModels = async () => {
      if (!make) {
        // No make selected, don't search
        setUniqueModels([]);
        setShowModelSuggestions(false);
        return;
      }

      if (modelInput.length < 1) {
        setUniqueModels([]);
        setShowModelSuggestions(false);
        return;
      }

      setIsSearchingCars(true);

      try {
        const params = new URLSearchParams();
        params.append("make", make);
        params.append("query", modelInput);
        params.append("limit", "20");

        const response = await fetch(`http://127.0.0.1:8000/api/cars/models?${params}`);
        const data = await response.json();

        if (data.status === "success") {
          setUniqueModels(data.models);
          setShowModelSuggestions(data.models.length > 0);
        }
      } catch (error) {
        console.error("Error searching models:", error);
      } finally {
        setIsSearchingCars(false);
      }
    };

    const debounceTimer = setTimeout(searchModels, 300);
    return () => clearTimeout(debounceTimer);
  }, [modelInput, make]);

  const handleMakeSelect = (selectedMake: string) => {
    setMake(selectedMake);
    setMakeInput(selectedMake);
    setShowMakeSuggestions(false);
    setSelectedMakeIndex(-1);
    // Clear model when make changes
    setModel("");
    setModelInput("");
  };

  const handleModelSelect = (selectedModel: string) => {
    setModel(selectedModel);
    setModelInput(selectedModel);
    setShowModelSuggestions(false);
    setSelectedModelIndex(-1);
  };

  const handleMakeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If no suggestions are showing, move to next field on Enter
    if (!showMakeSuggestions || uniqueMakes.length === 0) {
      if (e.key === "Enter" && makeInput.trim()) {
        // Allow manual entry and move to next field
        e.preventDefault();
        setMake(makeInput.trim());
        setShowMakeSuggestions(false);
        // Blur current input, then focus next field
        e.currentTarget.blur();
        setTimeout(() => {
          modelInputRef.current?.focus();
        }, 0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMakeIndex((prev) => (prev < uniqueMakes.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMakeIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // If no item is selected with arrow keys, select the first one
      const indexToSelect = selectedMakeIndex >= 0 ? selectedMakeIndex : 0;
      handleMakeSelect(uniqueMakes[indexToSelect]);
      // Blur current input to close suggestions, then focus next field
      e.currentTarget.blur();
      setTimeout(() => {
        modelInputRef.current?.focus();
      }, 0);
    } else if (e.key === "Escape") {
      setShowMakeSuggestions(false);
      setSelectedMakeIndex(-1);
    }
  };

  const handleModelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If no suggestions are showing, move to next field on Enter
    if (!showModelSuggestions || uniqueModels.length === 0) {
      if (e.key === "Enter" && modelInput.trim()) {
        // Allow manual entry and move to next field
        e.preventDefault();
        setModel(modelInput.trim());
        setShowModelSuggestions(false);
        // Blur current input, then focus next field
        e.currentTarget.blur();
        setTimeout(() => {
          colorSelectRef.current?.focus();
        }, 0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedModelIndex((prev) => (prev < uniqueModels.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedModelIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // If no item is selected with arrow keys, select the first one
      const indexToSelect = selectedModelIndex >= 0 ? selectedModelIndex : 0;
      handleModelSelect(uniqueModels[indexToSelect]);
      // Blur current input to close suggestions, then focus next field
      e.currentTarget.blur();
      setTimeout(() => {
        colorSelectRef.current?.focus();
      }, 0);
    } else if (e.key === "Escape") {
      setShowModelSuggestions(false);
      setSelectedModelIndex(-1);
    }
  };

  // Simulate streaming analysis steps
  const simulateAnalysisSteps = () => {
    const steps = [
      "Initializing video analysis...",
      "Loading media file...",
      "Extracting frames...",
      "Running vehicle detection model...",
      "Identifying vehicle characteristics...",
      "Analyzing license plates...",
      "Processing color information...",
      "Matching against search criteria...",
      "Generating analysis report...",
      "Finalizing results...",
    ];

    setAnalysisSteps([]);
    setCurrentStep("");

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setAnalysisSteps((prev) => [...prev, step]);
        setCurrentStep(step);
        stepIndex++;
      } else {
        clearInterval(stepInterval);
        setCurrentStep("Analysis complete!");
      }
    }, 600);

    return stepInterval;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setRawFile(file);
      const fileURL = URL.createObjectURL(file);
      setMediaFile(fileURL);

      if (file.type.startsWith("image/")) {
        setMediaType("image");
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
      }

      setResult("");
      setScreenshot(null);
      setAnalysisSteps([]);
      setCurrentStep("");
    }
  };

  const handleInsertClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleSearch = async (): Promise<void> => {
    if (!rawFile) {
      alert("Please insert a media file first.");
      return;
    }

    setIsLoading(true);
    setResult("");
    setScreenshot(null);

    const stepInterval = simulateAnalysisSteps();

    const formData = new FormData();
    formData.append("media", rawFile);
    formData.append("make", make);
    formData.append("model", model);
    formData.append("color", color);
    formData.append("licensePlate", licensePlate);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/search", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (data.status === "success") {
        setCurrentStep("Analysis complete!");
        setTimeout(() => {
          setResult(data.analysis);
          setScreenshot(data.screenshot);
        }, 300);
      } else {
        setCurrentStep("Analysis failed");
        alert("Error: " + data.message);
      }
    } catch (error) {
      clearInterval(stepInterval);
      console.error("Error:", error);
      setCurrentStep("Connection failed");
      alert("Failed to connect to backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setResult("");
    setScreenshot(null);
    setAnalysisSteps([]);
    setCurrentStep("");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Media Search App</h1>
        <p>Upload and search vehicle footage</p>
      </header>

      <main className="App-main">
        <div className="search-container">
          <div className="search-header">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="btn-toggle-search">
              <span className="toggle-icon">{showSearch ? "▼" : "▶"}</span>
              <span>{showSearch ? "Hide Search Panel" : "Show Search Panel"}</span>
            </button>
          </div>

          {showSearch && (
            <div className="search-content">
              <div className="search-toggle">
                <button
                  className={`toggle-btn ${searchMode === "simple" ? "active" : ""}`}
                  onClick={() => setSearchMode("simple")}>
                  Simple
                </button>
                <button
                  className={`toggle-btn ${searchMode === "advanced" ? "active" : ""}`}
                  onClick={() => setSearchMode("advanced")}>
                  Advanced
                </button>
              </div>

              {searchMode === "simple" ? (
                <div className="simple-search">
                  <div
                    className="search-field"
                    ref={makeSuggestionsRef}>
                    <label>Make</label>
                    <div className="input-with-clear">
                      <input
                        type="text"
                        value={makeInput}
                        onChange={(e) => setMakeInput(e.target.value)}
                        onFocus={() => {
                          // Don't auto-show suggestions on focus, let user start typing
                        }}
                        onKeyDown={handleMakeKeyDown}
                        placeholder="Type to search makes..."
                        disabled={isLoading}
                        className="autocomplete-input"
                      />
                      {makeInput && (
                        <button
                          className="clear-button"
                          onClick={() => {
                            setMakeInput("");
                            setMake("");
                            setModelInput("");
                            setModel("");
                          }}
                          type="button">
                          ✕
                        </button>
                      )}
                    </div>
                    {showMakeSuggestions && uniqueMakes.length > 0 && (
                      <div className="suggestions-dropdown">
                        {isSearchingCars && <div className="suggestions-loading">Searching...</div>}
                        {uniqueMakes.map((makeName, index) => (
                          <div
                            key={index}
                            className={`suggestion-item ${index === selectedMakeIndex ? "selected" : ""}`}
                            onClick={() => handleMakeSelect(makeName)}
                            onMouseEnter={() => setSelectedMakeIndex(index)}>
                            <div className="suggestion-main">
                              <strong>{makeName}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {makeInput.length >= 1 && !isSearchingCars && uniqueMakes.length === 0 && (
                      <div className="suggestions-dropdown">
                        <div className="no-results">No makes found for "{makeInput}"</div>
                      </div>
                    )}
                  </div>

                  <div
                    className="search-field"
                    ref={modelSuggestionsRef}>
                    <label>Model {make && <span className="field-hint">for {make}</span>}</label>
                    <input
                      ref={modelInputRef}
                      type="text"
                      value={modelInput}
                      onChange={(e) => setModelInput(e.target.value)}
                      onKeyDown={handleModelKeyDown}
                      onFocus={() => {
                        if (!make) {
                          alert("Please select a Make first");
                          return;
                        }
                        // Don't auto-show suggestions on focus, let user start typing
                      }}
                      placeholder={make ? `Type to search ${make} models...` : "Select a make first"}
                      disabled={isLoading || !make}
                      className="autocomplete-input"
                    />
                    {!make && modelInput.length === 0 && <div className="field-hint-message">⬆ Select a make first to search models</div>}
                    {showModelSuggestions && uniqueModels.length > 0 && (
                      <div className="suggestions-dropdown">
                        {isSearchingCars && <div className="suggestions-loading">Searching...</div>}
                        {uniqueModels.map((modelName, index) => (
                          <div
                            key={index}
                            className={`suggestion-item ${index === selectedModelIndex ? "selected" : ""}`}
                            onClick={() => handleModelSelect(modelName)}
                            onMouseEnter={() => setSelectedModelIndex(index)}>
                            <div className="suggestion-main">
                              <strong>{modelName}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {make && modelInput.length > 0 && !isSearchingCars && uniqueModels.length === 0 && showModelSuggestions && (
                      <div className="suggestions-dropdown">
                        <div className="no-results">No models found for "{modelInput}"</div>
                      </div>
                    )}
                  </div>

                  <div className="search-field">
                    <label>Color</label>
                    <select
                      ref={colorSelectRef}
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      disabled={isLoading}>
                      <option value="">Select Color</option>
                      {colors.map((c) => (
                        <option
                          key={c}
                          value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="search-field">
                    <label>License Plate</label>
                    <input
                      ref={licensePlateInputRef}
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="Enter license plate"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="advanced-search">
                  <div className="search-field">
                    <label>Advanced Search Query</label>
                    <textarea
                      value={advancedSearch}
                      onChange={(e) => setAdvancedSearch(e.target.value)}
                      placeholder="Enter advanced search query..."
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="search-actions">
                <button
                  onClick={handleInsertClick}
                  className="btn-insert"
                  disabled={isLoading}>
                  <span className="btn-icon">📁</span>
                  <span>Insert File</span>
                </button>
                <button
                  onClick={handleSearch}
                  className="btn-execute-search"
                  disabled={isLoading || !rawFile}>
                  <span className="btn-icon">🔍</span>
                  <span>{isLoading ? "Analyzing..." : "Execute Search"}</span>
                </button>
              </div>

              {/* Search Summary */}
              {searchMode === "simple" && (make || model || color || licensePlate) && (
                <div className="search-summary">
                  <strong>Searching for:</strong>
                  <div className="search-criteria">
                    {color && <span className="criterion">{color}</span>}
                    {make && <span className="criterion">{make}</span>}
                    {model && <span className="criterion">{model}</span>}
                    {licensePlate && <span className="criterion">Plate: {licensePlate}</span>}
                  </div>
                </div>
              )}
              {searchMode === "advanced" && advancedSearch && (
                <div className="search-summary">
                  <strong>Advanced Query:</strong>
                  <div className="search-criteria">
                    <span className="criterion">{advancedSearch.length > 100 ? advancedSearch.substring(0, 100) + "..." : advancedSearch}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="media-container">
          {mediaFile ? (
            <>
              {mediaType === "image" ? (
                <img
                  src={mediaFile}
                  alt="Uploaded content"
                  className="media-display"
                />
              ) : (
                <video
                  src={mediaFile}
                  controls
                  className="media-display"
                />
              )}
              <div className="media-overlay">
                <span className="media-label">{mediaType === "image" ? "Image" : "Video"} loaded</span>
              </div>
            </>
          ) : (
            <div className="media-placeholder">
              <div className="placeholder-icon">📹</div>
              <p>No media loaded</p>
              <p className="placeholder-hint">Click "Insert File" to get started</p>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="analysis-progress">
            <div className="progress-header">
              <h3>Analysis in Progress</h3>
              <div className="progress-spinner"></div>
            </div>
            <div className="steps-container">
              {analysisSteps.map((step, index) => (
                <div
                  key={index}
                  className="step-item completed"
                  style={{ animationDelay: `${index * 0.1}s` }}>
                  <span className="step-check">✓</span>
                  <span className="step-text">{step}</span>
                </div>
              ))}
              {currentStep && currentStep !== "Analysis complete!" && (
                <div className="step-item current">
                  <span className="step-cursor">▶</span>
                  <span className="step-text">{currentStep}</span>
                  <span className="typing-cursor"></span>
                </div>
              )}
              <div ref={stepsEndRef} />
            </div>
          </div>
        )}

        {result && !isLoading && (
          <div className="result-container">
            <div className="result-header">
              <h2>Search Results</h2>
              <button
                onClick={handleClearResults}
                className="btn-clear">
                Clear Results
              </button>
            </div>

            <div className="result-box">
              <h3>AI Analysis:</h3>
              <p>{result}</p>
            </div>

            {screenshot ? (
              <div className="screenshot-box">
                <h3>Detection Snapshot:</h3>
                <img
                  src={screenshot}
                  alt="Car detection moment"
                  className="detection-image"
                />
              </div>
            ) : (
              <div className="screenshot-box empty">
                <h3>Detection Snapshot:</h3>
                <p>No screenshot available for this search.</p>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          style={{ display: "none" }}
        />
      </main>
    </div>
  );
};

export default App;

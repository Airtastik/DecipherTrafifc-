import React, { useState, useRef } from 'react';
import './App.css';

const App: React.FC = () => {
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');
  const [advancedSearch, setAdvancedSearch] = useState<string>('');
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Nissan', 'Hyundai'];
  const models = ['Camry', 'Accord', 'F-150', 'Silverado', 'Model 3', 'Civic', 'Corolla', 'Mustang', 'CR-V', 'RAV4'];
  const colors = ['Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Brown'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setMediaFile(fileURL);
      
      if (file.type.startsWith('image/')) {
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      }
    }
  };

  const handleInsertClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleSearch = (): void => {
    if (searchMode === 'simple') {
      console.log('Simple Search:', { make, model, color, licensePlate });
      alert(`Searching for:\nMake: ${make}\nModel: ${model}\nColor: ${color}\nLicense: ${licensePlate}`);
    } else {
      console.log('Advanced Search:', advancedSearch);
      alert(`Advanced Search: ${advancedSearch}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Media Search App</h1>
        <p>Upload and search vehicle footage</p>
      </header>
      
      <main className="App-main">
        <div className="media-container">
          {mediaFile ? (
            mediaType === 'image' ? (
              <img src={mediaFile} alt="Uploaded content" className="media-display" />
            ) : (
              <video src={mediaFile} controls className="media-display" />
            )
          ) : (
            <div className="media-placeholder">
              <p>No media loaded</p>
            </div>
          )}
        </div>

        <div className="controls">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />
          <button onClick={handleInsertClick} className="btn-insert">
            Insert File
          </button>
          <button onClick={() => setShowSearch(!showSearch)} className="btn-search">
            {showSearch ? 'Hide Search' : 'Search'}
          </button>
        </div>

        {showSearch && (
          <div className="search-container">
            <div className="search-toggle">
              <button
                className={`toggle-btn ${searchMode === 'simple' ? 'active' : ''}`}
                onClick={() => setSearchMode('simple')}
              >
                Simple
              </button>
              <button
                className={`toggle-btn ${searchMode === 'advanced' ? 'active' : ''}`}
                onClick={() => setSearchMode('advanced')}
              >
                Advanced
              </button>
            </div>

            {searchMode === 'simple' ? (
              <div className="simple-search">
                <div className="search-field">
                  <label>Make</label>
                  <select value={make} onChange={(e) => setMake(e.target.value)}>
                    <option value="">Select Make</option>
                    {makes.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="search-field">
                  <label>Model</label>
                  <select value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value="">Select Model</option>
                    {models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="search-field">
                  <label>Color</label>
                  <select value={color} onChange={(e) => setColor(e.target.value)}>
                    <option value="">Select Color</option>
                    {colors.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="search-field">
                  <label>License Plate</label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="Enter license plate"
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
                  />
                </div>
              </div>
            )}

            <button onClick={handleSearch} className="btn-execute-search">
              Execute Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

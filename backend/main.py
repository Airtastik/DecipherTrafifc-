from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from twelvelabs import TwelveLabs
from dotenv import load_dotenv
import cv2
import base64
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Twelve Labs
client = TwelveLabs(api_key=os.getenv("TWELVE_KEY"))

# API Ninjas API Key
API_NINJAS_KEY = os.getenv("API_NINJAS_KEY")

# Common car makes for quick suggestions (alphabetically sorted)
COMMON_MAKES = [
    "Acura", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Buick", 
    "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", 
    "Genesis", "GMC", "Honda", "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", 
    "Lamborghini", "Land Rover", "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", 
    "McLaren", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", 
    "Porsche", "Ram", "Renault", "Rolls-Royce", "Subaru", "Tesla", "Toyota", 
    "Volkswagen", "Volvo"
]

# Popular models by make as fallback
POPULAR_MODELS = {
    "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra", "4Runner", "Prius", "Sienna", "Avalon"],
    "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey", "Ridgeline", "HR-V", "Passport", "Fit"],
    "Ford": ["F-150", "Mustang", "Explorer", "Escape", "Edge", "Bronco", "Ranger", "Expedition", "Maverick"],
    "Chevrolet": ["Silverado", "Equinox", "Malibu", "Tahoe", "Traverse", "Camaro", "Corvette", "Colorado", "Blazer"],
    "BMW": ["3 Series", "5 Series", "X3", "X5", "7 Series", "X1", "4 Series", "X7", "2 Series"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE", "S-Class", "A-Class", "GLA", "GLS", "CLA"],
    "Audi": ["A4", "Q5", "A3", "Q7", "A6", "Q3", "e-tron", "A5", "Q8"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    "Nissan": ["Altima", "Rogue", "Sentra", "Pathfinder", "Frontier", "Maxima", "Murano", "Kicks"],
    "Hyundai": ["Elantra", "Tucson", "Santa Fe", "Sonata", "Kona", "Palisade", "Venue", "Ioniq"],
    "Kia": ["Forte", "Sportage", "Sorento", "Soul", "Telluride", "Seltos", "Stinger", "Carnival"],
    "Mazda": ["CX-5", "Mazda3", "CX-9", "CX-30", "Mazda6", "MX-5 Miata", "CX-50"],
    "Subaru": ["Outback", "Forester", "Crosstrek", "Impreza", "Ascent", "Legacy", "WRX"],
    "Volkswagen": ["Jetta", "Tiguan", "Passat", "Atlas", "Golf", "Taos", "ID.4"],
    "Lexus": ["RX", "ES", "NX", "IS", "GX", "LS", "UX", "LX"],
    "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator", "Renegade"],
    "Ram": ["1500", "2500", "3500", "ProMaster"],
    "GMC": ["Sierra", "Acadia", "Terrain", "Yukon", "Canyon"],
    "Dodge": ["Charger", "Challenger", "Durango", "Ram"],
    "Cadillac": ["Escalade", "XT5", "CT5", "XT4", "XT6"],
    "Porsche": ["911", "Cayenne", "Macan", "Panamera", "Taycan", "718"],
    "Land Rover": ["Range Rover", "Discovery", "Defender", "Range Rover Sport", "Range Rover Evoque"],
    "Volvo": ["XC90", "XC60", "S60", "V60", "XC40", "S90"],
    "Acura": ["MDX", "RDX", "TLX", "ILX", "NSX"],
    "Infiniti": ["Q50", "QX60", "QX80", "Q60", "QX50"],
    "Genesis": ["G70", "G80", "G90", "GV70", "GV80"],
    "Mitsubishi": ["Outlander", "Eclipse Cross", "Mirage", "Outlander Sport"],
    "Mini": ["Cooper", "Countryman", "Clubman"],
    "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
    "Chrysler": ["Pacifica", "300", "Voyager"],
    "Buick": ["Encore", "Envision", "Enclave"],
    "Lincoln": ["Aviator", "Nautilus", "Navigator", "Corsair"],
}

def extract_high_quality_frame(video_path, timestamp_seconds):
    """Extract a high-quality frame from video at specific timestamp"""
    try:
        print(f"Extracting frame from {video_path} at {timestamp_seconds}s...")
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print("Failed to open video file")
            return None
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        print(f"Video: {fps} fps, {total_frames} total frames")
        
        # Set video position to timestamp (in milliseconds)
        cap.set(cv2.CAP_PROP_POS_MSEC, timestamp_seconds * 1000)
        
        # Read the frame
        success, frame = cap.read()
        cap.release()
        
        if success and frame is not None:
            # Save frame as high-quality JPEG (quality 95/100)
            output_filename = f"frame_{int(time.time())}_{int(timestamp_seconds)}.jpg"
            output_path = os.path.join(os.getcwd(), output_filename)
            
            # Use maximum quality settings
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, 95]
            cv2.imwrite(output_path, frame, encode_params)
            
            print(f"✓ Frame extracted successfully: {output_path}")
            print(f"  Frame size: {frame.shape[1]}x{frame.shape[0]}")
            return output_path
        else:
            print("Failed to read frame from video")
            return None
            
    except Exception as e:
        print(f"Error extracting frame: {e}")
        import traceback
        traceback.print_exc()
        return None

@app.route('/api/cars/makes', methods=['GET'])
def search_makes():
    """Search car makes from built-in list"""
    try:
        query = request.args.get('query', '').strip().lower()
        
        if len(query) < 1:
            return jsonify({
                "status": "success",
                "makes": []
            })
        
        # Filter makes that contain the query
        matching_makes = [
            make for make in COMMON_MAKES 
            if query in make.lower()
        ]
        
        print(f"Make search '{query}': found {len(matching_makes)} matches")
        
        return jsonify({
            "status": "success",
            "makes": matching_makes[:10]  # Limit to 10
        })
        
    except Exception as e:
        print(f"Error searching makes: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/cars/models', methods=['GET'])
def search_models():
    """Search car models using API Ninjas with fallback to popular models"""
    try:
        make = request.args.get('make', '').strip()
        query = request.args.get('query', '').strip().lower()
        limit = int(request.args.get('limit', '20'))
        
        if not make:
            return jsonify({
                "status": "error",
                "message": "Make is required"
            }), 400
        
        models = []
        
        # Try API Ninjas first if API key is available
        if API_NINJAS_KEY:
            try:
                api_url = 'https://api.api-ninjas.com/v1/cars'
                params = {
                    'make': make,
                    'limit': 50
                }
                
                headers = {
                    'X-Api-Key': API_NINJAS_KEY
                }
                
                print(f"Fetching models for make: {make} from API Ninjas")
                response = requests.get(api_url, params=params, headers=headers, timeout=5)
                
                if response.status_code == 200:
                    cars = response.json()
                    models = list(set([car['model'] for car in cars if 'model' in car]))
                    print(f"✓ API Ninjas returned {len(models)} models")
                else:
                    print(f"⚠ API Ninjas returned status {response.status_code}")
                    
            except requests.exceptions.Timeout:
                print("⚠ API Ninjas request timeout, using fallback")
            except Exception as e:
                print(f"⚠ API Ninjas error: {str(e)}, using fallback")
        
        # Fallback to popular models if API didn't work or returned nothing
        if not models and make in POPULAR_MODELS:
            models = POPULAR_MODELS[make]
            print(f"✓ Using fallback popular models for {make}: {len(models)} models")
        
        # Filter by query if provided
        if query:
            matching_models = [
                model for model in models 
                if query in model.lower()
            ]
        else:
            matching_models = models
        
        # Sort and limit
        matching_models.sort()
        matching_models = matching_models[:limit]
        
        print(f"Returning {len(matching_models)} models for {make}")
        
        return jsonify({
            "status": "success",
            "models": matching_models
        })
            
    except Exception as e:
        print(f"Error searching models: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/search', methods=['POST'])
def search_media():
    # 1. Get Form Data from React
    make = request.form.get('make', 'unknown')
    model = request.form.get('model', 'unknown')
    color = request.form.get('color', 'unknown')
    file = request.files.get('media')
    
    if not file:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    # 2. Save file temporarily to process it
    temp_path = os.path.join(os.getcwd(), file.filename)
    file.save(temp_path)
    frame_path = None

    try:
        # 3. Create Index
        index_name = f"index_{int(time.time())}"
        index = client.indexes.create(
            index_name=index_name,
            models=[
                # Pegasus for the text analysis
                {"model_name": "pegasus1.2", "model_options": ["visual", "audio"]},
                # Marengo for the search/screenshot capability
                {"model_name": "marengo2.7", "model_options": ["visual", "audio"]}
            ]
        )
        print(f"Index created: {index.id}")

        # 4. Upload File to Twelve Labs
        with open(temp_path, "rb") as video_file:
            asset = client.assets.create(method="direct", file=video_file)
        print(f"Asset created: {asset.id}")

        # 5. Index the asset
        indexed_asset = client.indexes.indexed_assets.create(
            index_id=index.id,
            asset_id=asset.id,
            enable_video_stream=True
        )
        print(f"Indexed asset created: {indexed_asset.id}")

        # 6. Wait for indexing (Poll status)
        print("Indexing in progress...")
        while True:
            indexed_asset = client.indexes.indexed_assets.retrieve(
                index_id=index.id,
                indexed_asset_id=indexed_asset.id
            )
            print(f"Indexing status: {indexed_asset.status}")
            if indexed_asset.status == "ready":
                print("Indexing complete!")
                break
            elif indexed_asset.status == "failed":
                raise Exception("Twelve Labs Indexing failed")
            time.sleep(5)

        # 7. Analyze with Twelve Labs
        prompt = f"Analyze the video completely. Is there a {color} {make} {model}?"
        print(f"Analysis prompt: {prompt}")
        text_stream = client.analyze_stream(
            video_id=indexed_asset.id,
            prompt=prompt
        )

        full_response = ""
        for text in text_stream:
            if text.event_type == "text_generation":
                full_response += text.text
        print(f"Analysis complete: {full_response[:100]}...")

        # 8. SEARCH for the vehicle to get the timestamp
        search_query = f"a {color} {make} {model}"
        print(f"Searching for: {search_query}")
        
        search_results = client.search.query(
            index_id=index.id,
            query_text=search_query,
            search_options=["visual"],
            page_limit=5
        )

        screenshot_url = None
        match_timestamp = None
        
        try:
            results_list = list(search_results)
            print(f"Number of search results: {len(results_list)}")
            
            if results_list and len(results_list) > 0:
                first_result = results_list[0]
                match_timestamp = first_result.start
                print(f"Best match at timestamp: {match_timestamp}s (score: {first_result.score})")
                
                # 9. EXTRACT HIGH-QUALITY FRAME using OpenCV
                frame_path = extract_high_quality_frame(temp_path, match_timestamp)
                
                if frame_path and os.path.exists(frame_path):
                    # Convert to base64 to embed directly in response
                    with open(frame_path, 'rb') as img_file:
                        img_data = base64.b64encode(img_file.read()).decode('utf-8')
                        screenshot_url = f"data:image/jpeg;base64,{img_data}"
                    
                    print("✓ High-quality frame converted to base64")
                else:
                    print("⚠ Failed to extract frame, falling back to HLS thumbnail")
                    
                    # FALLBACK: Use HLS thumbnail if frame extraction fails
                    refreshed_asset = client.indexes.indexed_assets.retrieve(
                        index_id=index.id,
                        indexed_asset_id=indexed_asset.id
                    )
                    
                    if hasattr(refreshed_asset, 'hls') and refreshed_asset.hls:
                        if hasattr(refreshed_asset.hls, 'thumbnail_urls') and refreshed_asset.hls.thumbnail_urls:
                            thumbnails = refreshed_asset.hls.thumbnail_urls
                            if thumbnails:
                                screenshot_url = thumbnails[0]
                                print(f"Using HLS thumbnail: {screenshot_url}")
                
                print(f"Final screenshot ready (base64: {len(screenshot_url) if screenshot_url else 0} chars)")
            else:
                print("No search results found.")
        except Exception as e:
            print(f"Error in search/extract: {str(e)}")
            import traceback
            traceback.print_exc()

        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if frame_path and os.path.exists(frame_path):
            os.remove(frame_path)

        return jsonify({
            "status": "success",
            "analysis": full_response,
            "screenshot": screenshot_url,
            "timestamp": match_timestamp
        })

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if frame_path and os.path.exists(frame_path):
            os.remove(frame_path)
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8000)
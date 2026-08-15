/**
 * citiesData.js
 * Comprehensive database containing:
 * 1. World's 100 Largest Cities / Megacities
 * 2. 5 Largest Cities of each of the 50 US States + Washington D.C. + Puerto Rico
 */

export const CITIES_DATABASE = [
    // ==========================================
    // TOP 100 WORLD MEGACITIES & MAJOR CAPITALS
    // ==========================================
    { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, category: "world" },
    { name: "Delhi", country: "India", lat: 28.6139, lon: 77.2090, category: "world" },
    { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737, category: "world" },
    { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125, category: "world" },
    { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, category: "world" },
    { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332, category: "world" },
    { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, category: "world" },
    { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074, category: "world" },
    { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777, category: "world" },
    { name: "Osaka", country: "Japan", lat: 34.6937, lon: 135.5023, category: "world" },
    { name: "Chongqing", country: "China", lat: 29.5630, lon: 106.5516, category: "world" },
    { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011, category: "world" },
    { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784, category: "world" },
    { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816, category: "world" },
    { name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639, category: "world" },
    { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792, category: "world" },
    { name: "Kinshasa", country: "DR Congo", lat: -4.4419, lon: 15.2663, category: "world" },
    { name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842, category: "world" },
    { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729, category: "world" },
    { name: "Guangzhou", country: "China", lat: 23.1291, lon: 113.2644, category: "world" },
    { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587, category: "world" },
    { name: "Shenzhen", country: "China", lat: 22.5431, lon: 114.0579, category: "world" },
    { name: "Bangalore", country: "India", lat: 12.9716, lon: 77.5946, category: "world" },
    { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, category: "world" },
    { name: "Tianjin", country: "China", lat: 39.3434, lon: 117.3616, category: "world" },
    { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456, category: "world" },
    { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, category: "world" },
    { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428, category: "world" },
    { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018, category: "world" },
    { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780, category: "world" },
    { name: "Nagoya", country: "Japan", lat: 35.1815, lon: 136.9066, category: "world" },
    { name: "Hyderabad", country: "India", lat: 17.3850, lon: 78.4867, category: "world" },
    { name: "Tehran", country: "Iran", lat: 35.6892, lon: 51.3890, category: "world" },
    { name: "Chicago", country: "USA", state: "IL", lat: 41.8781, lon: -87.6298, category: "world" },
    { name: "Chengdu", country: "China", lat: 30.5728, lon: 104.0668, category: "world" },
    { name: "Nanjing", country: "China", lat: 32.0603, lon: 118.7969, category: "world" },
    { name: "Wuhan", country: "China", lat: 30.5928, lon: 114.3055, category: "world" },
    { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297, category: "world" },
    { name: "Luanda", country: "Angola", lat: -8.8390, lon: 13.2894, category: "world" },
    { name: "Ahmedabad", country: "India", lat: 23.0225, lon: 72.5714, category: "world" },
    { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lon: 101.6869, category: "world" },
    { name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694, category: "world" },
    { name: "Dongguan", country: "China", lat: 23.0207, lon: 113.7518, category: "world" },
    { name: "Hangzhou", country: "China", lat: 30.2741, lon: 120.1551, category: "world" },
    { name: "Foshan", country: "China", lat: 23.0215, lon: 113.1214, category: "world" },
    { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753, category: "world" },
    { name: "Baghdad", country: "Iraq", lat: 33.3152, lon: 44.3661, category: "world" },
    { name: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693, category: "world" },
    { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, category: "world" },
    { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832, category: "world" },
    { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, category: "world" },
    { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, category: "world" },
    { name: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631, category: "world" },
    { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964, category: "world" },
    { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, category: "world" },
    { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, category: "world" },
    { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738, category: "world" },
    { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041, category: "world" },
    { name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708, category: "world" },
    { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473, category: "world" },
    { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, category: "world" },
    { name: "Casablanca", country: "Morocco", lat: 33.5731, lon: -7.5898, category: "world" },
    { name: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633, category: "world" },
    { name: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207, category: "world" },
    { name: "Montreal", country: "Canada", lat: 45.5017, lon: -73.5673, category: "world" },
    { name: "Bogotá", country: "Colombia", lat: 4.7110, lon: -74.0721, category: "world" },
    { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241, category: "world" },
    { name: "Taipei", country: "Taiwan", lat: 25.0330, lon: 121.5654, category: "world" },
    { name: "Tel Aviv", country: "Israel", lat: 32.0853, lon: 34.7818, category: "world" },
    { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686, category: "world" },
    { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122, category: "world" },
    { name: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517, category: "world" },
    { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393, category: "world" },
    { name: "Copenhagen", country: "Denmark", lat: 55.6761, lon: 12.5683, category: "world" },
    { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275, category: "world" },
    { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603, category: "world" },
    { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522, category: "world" },
    { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384, category: "world" },
    { name: "Prague", country: "Czech Republic", lat: 50.0755, lon: 14.4378, category: "world" },
    { name: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402, category: "world" },
    { name: "Doha", country: "Qatar", lat: 25.2854, lon: 51.5310, category: "world" },
    { name: "Abu Dhabi", country: "United Arab Emirates", lat: 24.4539, lon: 54.3773, category: "world" },
    { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426, category: "world" },
    { name: "Zurich", country: "Switzerland", lat: 47.3769, lon: 8.5417, category: "world" },
    { name: "Geneva", country: "Switzerland", lat: 46.2044, lon: 6.1432, category: "world" },
    { name: "Kyiv", country: "Ukraine", lat: 50.4501, lon: 30.5234, category: "world" },
    { name: "Hanoi", country: "Vietnam", lat: 21.0285, lon: 105.8542, category: "world" },
    { name: "Surat", country: "India", lat: 21.1702, lon: 72.8311, category: "world" },
    { name: "Pune", country: "India", lat: 18.5204, lon: 73.8567, category: "world" },
    { name: "Alexandria", country: "Egypt", lat: 31.2001, lon: 29.9187, category: "world" },
    { name: "Guadalajara", country: "Mexico", lat: 20.6597, lon: -103.3496, category: "world" },
    { name: "Monterrey", country: "Mexico", lat: 25.6866, lon: -100.3161, category: "world" },
    { name: "Addis Ababa", country: "Ethiopia", lat: 9.0320, lon: 38.7482, category: "world" },
    { name: "Accra", country: "Ghana", lat: 5.6037, lon: -0.1870, category: "world" },
    { name: "Algiers", country: "Algeria", lat: 36.7538, lon: 3.0588, category: "world" },
    { name: "Khartoum", country: "Sudan", lat: 15.5007, lon: 32.5599, category: "world" },
    { name: "Caracas", country: "Venezuela", lat: 10.4806, lon: -66.9036, category: "world" },
    { name: "Brasília", country: "Brazil", lat: -15.8267, lon: -47.9218, category: "world" },
    { name: "Medellín", country: "Colombia", lat: 6.2442, lon: -75.5812, category: "world" },
    { name: "Brisbane", country: "Australia", lat: -27.4698, lon: 153.0251, category: "world" },
    { name: "Perth", country: "Australia", lat: -31.9505, lon: 115.8605, category: "world" },

    // ==========================================
    // TOP 5 CITIES OF EACH US STATE + DC + PR
    // ==========================================
    // Alabama (AL)
    { name: "Huntsville", state: "AL", country: "USA", lat: 34.7304, lon: -86.5861, category: "us" },
    { name: "Birmingham", state: "AL", country: "USA", lat: 33.5186, lon: -86.8104, category: "us" },
    { name: "Montgomery", state: "AL", country: "USA", lat: 32.3792, lon: -86.3077, category: "us" },
    { name: "Mobile", state: "AL", country: "USA", lat: 30.6954, lon: -88.0399, category: "us" },
    { name: "Tuscaloosa", state: "AL", country: "USA", lat: 33.2098, lon: -87.5692, category: "us" },

    // Alaska (AK)
    { name: "Anchorage", state: "AK", country: "USA", lat: 61.2181, lon: -149.9003, category: "us" },
    { name: "Fairbanks", state: "AK", country: "USA", lat: 64.8378, lon: -147.7164, category: "us" },
    { name: "Juneau", state: "AK", country: "USA", lat: 58.3019, lon: -134.4197, category: "us" },
    { name: "Wasilla", state: "AK", country: "USA", lat: 61.5814, lon: -149.4394, category: "us" },
    { name: "Sitka", state: "AK", country: "USA", lat: 57.0531, lon: -135.3300, category: "us" },

    // Arizona (AZ)
    { name: "Phoenix", state: "AZ", country: "USA", lat: 33.4484, lon: -112.0740, category: "us" },
    { name: "Tucson", state: "AZ", country: "USA", lat: 32.2226, lon: -110.9747, category: "us" },
    { name: "Mesa", state: "AZ", country: "USA", lat: 33.4152, lon: -111.8315, category: "us" },
    { name: "Chandler", state: "AZ", country: "USA", lat: 33.3062, lon: -111.8413, category: "us" },
    { name: "Scottsdale", state: "AZ", country: "USA", lat: 33.4942, lon: -111.9261, category: "us" },

    // Arkansas (AR)
    { name: "Little Rock", state: "AR", country: "USA", lat: 34.7465, lon: -92.2896, category: "us" },
    { name: "Fayetteville", state: "AR", country: "USA", lat: 36.0822, lon: -94.1719, category: "us" },
    { name: "Fort Smith", state: "AR", country: "USA", lat: 35.3859, lon: -94.3985, category: "us" },
    { name: "Springdale", state: "AR", country: "USA", lat: 36.1867, lon: -94.1288, category: "us" },
    { name: "Jonesboro", state: "AR", country: "USA", lat: 35.8423, lon: -90.7043, category: "us" },

    // California (CA)
    { name: "Los Angeles", state: "CA", country: "USA", lat: 34.0522, lon: -118.2437, category: "us" },
    { name: "San Diego", state: "CA", country: "USA", lat: 32.7157, lon: -117.1611, category: "us" },
    { name: "San Jose", state: "CA", country: "USA", lat: 37.3382, lon: -121.8863, category: "us" },
    { name: "San Francisco", state: "CA", country: "USA", lat: 37.7749, lon: -122.4194, category: "us" },
    { name: "Fresno", state: "CA", country: "USA", lat: 36.7468, lon: -119.7726, category: "us" },

    // Colorado (CO)
    { name: "Denver", state: "CO", country: "USA", lat: 39.7392, lon: -104.9903, category: "us" },
    { name: "Colorado Springs", state: "CO", country: "USA", lat: 38.8339, lon: -104.8214, category: "us" },
    { name: "Aurora", state: "CO", country: "USA", lat: 39.7294, lon: -104.8319, category: "us" },
    { name: "Fort Collins", state: "CO", country: "USA", lat: 40.5853, lon: -105.0844, category: "us" },
    { name: "Lakewood", state: "CO", country: "USA", lat: 39.7047, lon: -105.0814, category: "us" },

    // Connecticut (CT)
    { name: "Bridgeport", state: "CT", country: "USA", lat: 41.1792, lon: -73.1894, category: "us" },
    { name: "Stamford", state: "CT", country: "USA", lat: 41.0534, lon: -73.5387, category: "us" },
    { name: "New Haven", state: "CT", country: "USA", lat: 41.3083, lon: -72.9279, category: "us" },
    { name: "Hartford", state: "CT", country: "USA", lat: 41.7658, lon: -72.6734, category: "us" },
    { name: "Waterbury", state: "CT", country: "USA", lat: 41.5582, lon: -73.0515, category: "us" },

    // Delaware (DE)
    { name: "Wilmington", state: "DE", country: "USA", lat: 39.7447, lon: -75.5484, category: "us" },
    { name: "Dover", state: "DE", country: "USA", lat: 39.1582, lon: -75.5244, category: "us" },
    { name: "Newark", state: "DE", country: "USA", lat: 39.6837, lon: -75.7497, category: "us" },
    { name: "Middletown", state: "DE", country: "USA", lat: 39.4496, lon: -75.7163, category: "us" },
    { name: "Smyrna", state: "DE", country: "USA", lat: 39.2998, lon: -75.6047, category: "us" },

    // Florida (FL)
    { name: "Jacksonville", state: "FL", country: "USA", lat: 30.3322, lon: -81.6557, category: "us" },
    { name: "Miami", state: "FL", country: "USA", lat: 25.7617, lon: -80.1918, category: "us" },
    { name: "Tampa", state: "FL", country: "USA", lat: 27.9506, lon: -82.4572, category: "us" },
    { name: "Orlando", state: "FL", country: "USA", lat: 28.5383, lon: -81.3792, category: "us" },
    { name: "St. Petersburg", state: "FL", country: "USA", lat: 27.7676, lon: -82.6403, category: "us" },

    // Georgia (GA)
    { name: "Atlanta", state: "GA", country: "USA", lat: 33.7490, lon: -84.3880, category: "us" },
    { name: "Columbus", state: "GA", country: "USA", lat: 32.4610, lon: -84.9877, category: "us" },
    { name: "Augusta", state: "GA", country: "USA", lat: 33.4735, lon: -82.0105, category: "us" },
    { name: "Macon", state: "GA", country: "USA", lat: 32.8407, lon: -83.6324, category: "us" },
    { name: "Savannah", state: "GA", country: "USA", lat: 32.0809, lon: -81.0912, category: "us" },

    // Hawaii (HI)
    { name: "Honolulu", state: "HI", country: "USA", lat: 21.3069, lon: -157.8583, category: "us" },
    { name: "East Honolulu", state: "HI", country: "USA", lat: 21.2891, lon: -157.7174, category: "us" },
    { name: "Pearl City", state: "HI", country: "USA", lat: 21.3972, lon: -157.9733, category: "us" },
    { name: "Hilo", state: "HI", country: "USA", lat: 19.7297, lon: -155.0900, category: "us" },
    { name: "Kailua", state: "HI", country: "USA", lat: 21.4022, lon: -157.7394, category: "us" },

    // Idaho (ID)
    { name: "Boise", state: "ID", country: "USA", lat: 43.6150, lon: -116.2023, category: "us" },
    { name: "Meridian", state: "ID", country: "USA", lat: 43.6121, lon: -116.3915, category: "us" },
    { name: "Nampa", state: "ID", country: "USA", lat: 43.5407, lon: -116.5635, category: "us" },
    { name: "Idaho Falls", state: "ID", country: "USA", lat: 43.4927, lon: -112.0340, category: "us" },
    { name: "Caldwell", state: "ID", country: "USA", lat: 43.6629, lon: -116.6874, category: "us" },

    // Illinois (IL)
    { name: "Chicago", state: "IL", country: "USA", lat: 41.8781, lon: -87.6298, category: "us" },
    { name: "Aurora", state: "IL", country: "USA", lat: 41.7606, lon: -88.3201, category: "us" },
    { name: "Joliet", state: "IL", country: "USA", lat: 41.5250, lon: -88.0817, category: "us" },
    { name: "Naperville", state: "IL", country: "USA", lat: 41.7508, lon: -88.1535, category: "us" },
    { name: "Rockford", state: "IL", country: "USA", lat: 42.2711, lon: -89.0940, category: "us" },

    // Indiana (IN)
    { name: "Indianapolis", state: "IN", country: "USA", lat: 39.7684, lon: -86.1581, category: "us" },
    { name: "Fort Wayne", state: "IN", country: "USA", lat: 41.0793, lon: -85.1394, category: "us" },
    { name: "Evansville", state: "IN", country: "USA", lat: 37.9716, lon: -87.5711, category: "us" },
    { name: "South Bend", state: "IN", country: "USA", lat: 41.6764, lon: -86.2520, category: "us" },
    { name: "Carmel", state: "IN", country: "USA", lat: 39.9784, lon: -86.1180, category: "us" },

    // Iowa (IA)
    { name: "Des Moines", state: "IA", country: "USA", lat: 41.5868, lon: -93.6250, category: "us" },
    { name: "Cedar Rapids", state: "IA", country: "USA", lat: 41.9779, lon: -91.6656, category: "us" },
    { name: "Davenport", state: "IA", country: "USA", lat: 41.5236, lon: -90.5776, category: "us" },
    { name: "Sioux City", state: "IA", country: "USA", lat: 42.4999, lon: -96.4003, category: "us" },
    { name: "Iowa City", state: "IA", country: "USA", lat: 41.6611, lon: -91.5302, category: "us" },

    // Kansas (KS)
    { name: "Wichita", state: "KS", country: "USA", lat: 37.6872, lon: -97.3301, category: "us" },
    { name: "Overland Park", state: "KS", country: "USA", lat: 38.9822, lon: -94.6708, category: "us" },
    { name: "Kansas City", state: "KS", country: "USA", lat: 39.1155, lon: -94.6268, category: "us" },
    { name: "Olathe", state: "KS", country: "USA", lat: 38.8814, lon: -94.8191, category: "us" },
    { name: "Topeka", state: "KS", country: "USA", lat: 39.0473, lon: -95.6752, category: "us" },

    // Kentucky (KY)
    { name: "Louisville", state: "KY", country: "USA", lat: 38.2527, lon: -85.7585, category: "us" },
    { name: "Lexington", state: "KY", country: "USA", lat: 38.0406, lon: -84.5037, category: "us" },
    { name: "Bowling Green", state: "KY", country: "USA", lat: 36.9685, lon: -86.4808, category: "us" },
    { name: "Owensboro", state: "KY", country: "USA", lat: 37.7719, lon: -87.1112, category: "us" },
    { name: "Covington", state: "KY", country: "USA", lat: 39.0837, lon: -84.5086, category: "us" },

    // Louisiana (LA)
    { name: "New Orleans", state: "LA", country: "USA", lat: 29.9511, lon: -90.0715, category: "us" },
    { name: "Baton Rouge", state: "LA", country: "USA", lat: 30.4515, lon: -91.1871, category: "us" },
    { name: "Shreveport", state: "LA", country: "USA", lat: 32.5252, lon: -93.7502, category: "us" },
    { name: "Lafayette", state: "LA", country: "USA", lat: 30.2241, lon: -92.0198, category: "us" },
    { name: "Lake Charles", state: "LA", country: "USA", lat: 30.2266, lon: -93.2174, category: "us" },

    // Maine (ME)
    { name: "Portland", state: "ME", country: "USA", lat: 43.6591, lon: -70.2568, category: "us" },
    { name: "Lewiston", state: "ME", country: "USA", lat: 44.1004, lon: -70.2148, category: "us" },
    { name: "Bangor", state: "ME", country: "USA", lat: 44.8016, lon: -68.7712, category: "us" },
    { name: "South Portland", state: "ME", country: "USA", lat: 43.6415, lon: -70.2409, category: "us" },
    { name: "Auburn", state: "ME", country: "USA", lat: 44.0979, lon: -70.2312, category: "us" },

    // Maryland (MD)
    { name: "Baltimore", state: "MD", country: "USA", lat: 39.2904, lon: -76.6122, category: "us" },
    { name: "Frederick", state: "MD", country: "USA", lat: 39.4143, lon: -77.4105, category: "us" },
    { name: "Rockville", state: "MD", country: "USA", lat: 39.0840, lon: -77.1528, category: "us" },
    { name: "Gaithersburg", state: "MD", country: "USA", lat: 39.1434, lon: -77.2014, category: "us" },
    { name: "Bowie", state: "MD", country: "USA", lat: 38.9626, lon: -76.7364, category: "us" },

    // Massachusetts (MA)
    { name: "Boston", state: "MA", country: "USA", lat: 42.3601, lon: -71.0589, category: "us" },
    { name: "Worcester", state: "MA", country: "USA", lat: 42.2626, lon: -71.8023, category: "us" },
    { name: "Springfield", state: "MA", country: "USA", lat: 42.1015, lon: -72.5898, category: "us" },
    { name: "Cambridge", state: "MA", country: "USA", lat: 42.3736, lon: -71.1097, category: "us" },
    { name: "Lowell", state: "MA", country: "USA", lat: 42.6334, lon: -71.3162, category: "us" },

    // Michigan (MI)
    { name: "Detroit", state: "MI", country: "USA", lat: 42.3314, lon: -83.0458, category: "us" },
    { name: "Grand Rapids", state: "MI", country: "USA", lat: 42.9634, lon: -85.6681, category: "us" },
    { name: "Warren", state: "MI", country: "USA", lat: 42.5145, lon: -83.0147, category: "us" },
    { name: "Sterling Heights", state: "MI", country: "USA", lat: 42.5803, lon: -83.0302, category: "us" },
    { name: "Ann Arbor", state: "MI", country: "USA", lat: 42.2808, lon: -83.7430, category: "us" },

    // Minnesota (MN)
    { name: "Minneapolis", state: "MN", country: "USA", lat: 44.9778, lon: -93.2650, category: "us" },
    { name: "St. Paul", state: "MN", country: "USA", lat: 44.9537, lon: -93.0900, category: "us" },
    { name: "Rochester", state: "MN", country: "USA", lat: 44.0121, lon: -92.4802, category: "us" },
    { name: "Bloomington", state: "MN", country: "USA", lat: 44.8408, lon: -93.2983, category: "us" },
    { name: "Duluth", state: "MN", country: "USA", lat: 46.7867, lon: -92.1005, category: "us" },

    // Mississippi (MS)
    { name: "Jackson", state: "MS", country: "USA", lat: 32.2988, lon: -90.1848, category: "us" },
    { name: "Gulfport", state: "MS", country: "USA", lat: 30.3674, lon: -89.0928, category: "us" },
    { name: "Southaven", state: "MS", country: "USA", lat: 34.9919, lon: -89.9973, category: "us" },
    { name: "Biloxi", state: "MS", country: "USA", lat: 30.3960, lon: -88.8853, category: "us" },
    { name: "Hattiesburg", state: "MS", country: "USA", lat: 31.3271, lon: -89.2903, category: "us" },

    // Missouri (MO)
    { name: "Kansas City", state: "MO", country: "USA", lat: 39.0997, lon: -94.5786, category: "us" },
    { name: "St. Louis", state: "MO", country: "USA", lat: 38.6270, lon: -90.1994, category: "us" },
    { name: "Springfield", state: "MO", country: "USA", lat: 37.2090, lon: -93.2923, category: "us" },
    { name: "Columbia", state: "MO", country: "USA", lat: 38.9517, lon: -92.3341, category: "us" },
    { name: "Independence", state: "MO", country: "USA", lat: 39.0911, lon: -94.4155, category: "us" },

    // Montana (MT)
    { name: "Billings", state: "MT", country: "USA", lat: 45.7833, lon: -108.5007, category: "us" },
    { name: "Missoula", state: "MT", country: "USA", lat: 46.8722, lon: -113.9940, category: "us" },
    { name: "Great Falls", state: "MT", country: "USA", lat: 47.5053, lon: -111.3008, category: "us" },
    { name: "Bozeman", state: "MT", country: "USA", lat: 45.6770, lon: -111.0429, category: "us" },
    { name: "Butte", state: "MT", country: "USA", lat: 46.0038, lon: -112.5347, category: "us" },

    // Nebraska (NE)
    { name: "Omaha", state: "NE", country: "USA", lat: 41.2565, lon: -95.9345, category: "us" },
    { name: "Lincoln", state: "NE", country: "USA", lat: 40.8136, lon: -96.7026, category: "us" },
    { name: "Bellevue", state: "NE", country: "USA", lat: 41.1370, lon: -95.8908, category: "us" },
    { name: "Grand Island", state: "NE", country: "USA", lat: 40.9264, lon: -98.3420, category: "us" },
    { name: "Kearney", state: "NE", country: "USA", lat: 40.6995, lon: -99.0815, category: "us" },

    // Nevada (NV)
    { name: "Las Vegas", state: "NV", country: "USA", lat: 36.1699, lon: -115.1398, category: "us" },
    { name: "Henderson", state: "NV", country: "USA", lat: 36.0395, lon: -114.9817, category: "us" },
    { name: "Reno", state: "NV", country: "USA", lat: 39.5296, lon: -119.8138, category: "us" },
    { name: "North Las Vegas", state: "NV", country: "USA", lat: 36.1989, lon: -115.1175, category: "us" },
    { name: "Sparks", state: "NV", country: "USA", lat: 39.5349, lon: -119.7527, category: "us" },

    // New Hampshire (NH)
    { name: "Manchester", state: "NH", country: "USA", lat: 42.9956, lon: -71.4548, category: "us" },
    { name: "Nashua", state: "NH", country: "USA", lat: 42.7654, lon: -71.4676, category: "us" },
    { name: "Concord", state: "NH", country: "USA", lat: 43.2081, lon: -71.5376, category: "us" },
    { name: "Dover", state: "NH", country: "USA", lat: 43.1979, lon: -70.8737, category: "us" },
    { name: "Rochester", state: "NH", country: "USA", lat: 43.3045, lon: -70.9756, category: "us" },

    // New Jersey (NJ)
    { name: "Newark", state: "NJ", country: "USA", lat: 40.7357, lon: -74.1724, category: "us" },
    { name: "Jersey City", state: "NJ", country: "USA", lat: 40.7178, lon: -74.0431, category: "us" },
    { name: "Paterson", state: "NJ", country: "USA", lat: 40.9168, lon: -74.1718, category: "us" },
    { name: "Elizabeth", state: "NJ", country: "USA", lat: 40.6640, lon: -74.2107, category: "us" },
    { name: "Lakewood", state: "NJ", country: "USA", lat: 40.0984, lon: -74.2185, category: "us" },

    // New Mexico (NM)
    { name: "Albuquerque", state: "NM", country: "USA", lat: 35.0844, lon: -106.6504, category: "us" },
    { name: "Las Cruces", state: "NM", country: "USA", lat: 32.3199, lon: -106.7637, category: "us" },
    { name: "Rio Rancho", state: "NM", country: "USA", lat: 35.2328, lon: -106.6630, category: "us" },
    { name: "Santa Fe", state: "NM", country: "USA", lat: 35.6870, lon: -105.9378, category: "us" },
    { name: "Roswell", state: "NM", country: "USA", lat: 33.3943, lon: -104.5230, category: "us" },

    // New York (NY)
    { name: "New York City", state: "NY", country: "USA", lat: 40.7128, lon: -74.0060, category: "us" },
    { name: "Buffalo", state: "NY", country: "USA", lat: 42.8864, lon: -78.8784, category: "us" },
    { name: "Rochester", state: "NY", country: "USA", lat: 43.1566, lon: -77.6088, category: "us" },
    { name: "Yonkers", state: "NY", country: "USA", lat: 40.9312, lon: -73.8987, category: "us" },
    { name: "Syracuse", state: "NY", country: "USA", lat: 43.0481, lon: -76.1474, category: "us" },

    // North Carolina (NC)
    { name: "Charlotte", state: "NC", country: "USA", lat: 35.2271, lon: -80.8431, category: "us" },
    { name: "Raleigh", state: "NC", country: "USA", lat: 35.7796, lon: -78.6382, category: "us" },
    { name: "Greensboro", state: "NC", country: "USA", lat: 36.0726, lon: -79.7920, category: "us" },
    { name: "Durham", state: "NC", country: "USA", lat: 35.9940, lon: -78.8986, category: "us" },
    { name: "Winston-Salem", state: "NC", country: "USA", lat: 36.0999, lon: -80.2442, category: "us" },

    // North Dakota (ND)
    { name: "Fargo", state: "ND", country: "USA", lat: 46.8772, lon: -96.7898, category: "us" },
    { name: "Bismarck", state: "ND", country: "USA", lat: 46.8083, lon: -100.7837, category: "us" },
    { name: "Grand Forks", state: "ND", country: "USA", lat: 47.9253, lon: -97.0329, category: "us" },
    { name: "Minot", state: "ND", country: "USA", lat: 48.2330, lon: -101.2923, category: "us" },
    { name: "West Fargo", state: "ND", country: "USA", lat: 46.8744, lon: -96.9004, category: "us" },

    // Ohio (OH)
    { name: "Columbus", state: "OH", country: "USA", lat: 39.9612, lon: -82.9988, category: "us" },
    { name: "Cleveland", state: "OH", country: "USA", lat: 41.4993, lon: -81.6944, category: "us" },
    { name: "Cincinnati", state: "OH", country: "USA", lat: 39.1031, lon: -84.5120, category: "us" },
    { name: "Toledo", state: "OH", country: "USA", lat: 41.6528, lon: -83.5379, category: "us" },
    { name: "Akron", state: "OH", country: "USA", lat: 41.0814, lon: -81.5190, category: "us" },

    // Oklahoma (OK)
    { name: "Oklahoma City", state: "OK", country: "USA", lat: 35.4676, lon: -97.5164, category: "us" },
    { name: "Tulsa", state: "OK", country: "USA", lat: 36.1540, lon: -95.9928, category: "us" },
    { name: "Norman", state: "OK", country: "USA", lat: 35.2226, lon: -97.4395, category: "us" },
    { name: "Broken Arrow", state: "OK", country: "USA", lat: 36.0526, lon: -95.7908, category: "us" },
    { name: "Edmond", state: "OK", country: "USA", lat: 35.6528, lon: -97.4781, category: "us" },

    // Oregon (OR)
    { name: "Portland", state: "OR", country: "USA", lat: 45.5152, lon: -122.6784, category: "us" },
    { name: "Eugene", state: "OR", country: "USA", lat: 44.0521, lon: -123.0868, category: "us" },
    { name: "Salem", state: "OR", country: "USA", lat: 44.9429, lon: -123.0351, category: "us" },
    { name: "Gresham", state: "OR", country: "USA", lat: 45.4998, lon: -122.4312, category: "us" },
    { name: "Hillsboro", state: "OR", country: "USA", lat: 45.5229, lon: -122.9898, category: "us" },

    // Pennsylvania (PA)
    { name: "Philadelphia", state: "PA", country: "USA", lat: 39.9526, lon: -75.1652, category: "us" },
    { name: "Pittsburgh", state: "PA", country: "USA", lat: 40.4406, lon: -79.9959, category: "us" },
    { name: "Allentown", state: "PA", country: "USA", lat: 40.6084, lon: -75.4902, category: "us" },
    { name: "Reading", state: "PA", country: "USA", lat: 40.3356, lon: -75.9269, category: "us" },
    { name: "Erie", state: "PA", country: "USA", lat: 42.1292, lon: -80.0851, category: "us" },

    // Rhode Island (RI)
    { name: "Providence", state: "RI", country: "USA", lat: 41.8240, lon: -71.4128, category: "us" },
    { name: "Warwick", state: "RI", country: "USA", lat: 41.7001, lon: -71.4162, category: "us" },
    { name: "Cranston", state: "RI", country: "USA", lat: 41.7798, lon: -71.4373, category: "us" },
    { name: "Pawtucket", state: "RI", country: "USA", lat: 41.8787, lon: -71.3826, category: "us" },
    { name: "East Providence", state: "RI", country: "USA", lat: 41.8137, lon: -71.3701, category: "us" },

    // South Carolina (SC)
    { name: "Charleston", state: "SC", country: "USA", lat: 32.7765, lon: -79.9311, category: "us" },
    { name: "Columbia", state: "SC", country: "USA", lat: 34.0007, lon: -81.0348, category: "us" },
    { name: "North Charleston", state: "SC", country: "USA", lat: 32.8546, lon: -79.9748, category: "us" },
    { name: "Mount Pleasant", state: "SC", country: "USA", lat: 32.7941, lon: -79.8626, category: "us" },
    { name: "Rock Hill", state: "SC", country: "USA", lat: 34.9249, lon: -81.0259, category: "us" },

    // South Dakota (SD)
    { name: "Sioux Falls", state: "SD", country: "USA", lat: 43.5460, lon: -96.7313, category: "us" },
    { name: "Rapid City", state: "SD", country: "USA", lat: 44.0805, lon: -103.2310, category: "us" },
    { name: "Aberdeen", state: "SD", country: "USA", lat: 45.4647, lon: -98.4865, category: "us" },
    { name: "Brookings", state: "SD", country: "USA", lat: 44.3114, lon: -96.7984, category: "us" },
    { name: "Watertown", state: "SD", country: "USA", lat: 44.8994, lon: -97.1151, category: "us" },

    // Tennessee (TN)
    { name: "Nashville", state: "TN", country: "USA", lat: 36.1627, lon: -86.7816, category: "us" },
    { name: "Memphis", state: "TN", country: "USA", lat: 35.1495, lon: -90.0490, category: "us" },
    { name: "Knoxville", state: "TN", country: "USA", lat: 35.9606, lon: -83.9207, category: "us" },
    { name: "Chattanooga", state: "TN", country: "USA", lat: 35.0456, lon: -85.3097, category: "us" },
    { name: "Clarksville", state: "TN", country: "USA", lat: 36.5298, lon: -87.3595, category: "us" },

    // Texas (TX)
    { name: "Houston", state: "TX", country: "USA", lat: 29.7604, lon: -95.3698, category: "us" },
    { name: "San Antonio", state: "TX", country: "USA", lat: 29.4241, lon: -98.4936, category: "us" },
    { name: "Dallas", state: "TX", country: "USA", lat: 32.7767, lon: -96.7970, category: "us" },
    { name: "Austin", state: "TX", country: "USA", lat: 30.2672, lon: -97.7431, category: "us" },
    { name: "Fort Worth", state: "TX", country: "USA", lat: 32.7555, lon: -97.3308, category: "us" },

    // Utah (UT)
    { name: "Salt Lake City", state: "UT", country: "USA", lat: 40.7608, lon: -111.8910, category: "us" },
    { name: "West Valley City", state: "UT", country: "USA", lat: 40.6916, lon: -111.9963, category: "us" },
    { name: "Provo", state: "UT", country: "USA", lat: 40.2338, lon: -111.6585, category: "us" },
    { name: "West Jordan", state: "UT", country: "USA", lat: 40.6097, lon: -111.9391, category: "us" },
    { name: "Orem", state: "UT", country: "USA", lat: 40.2969, lon: -111.6946, category: "us" },

    // Vermont (VT)
    { name: "Burlington", state: "VT", country: "USA", lat: 44.4759, lon: -73.2121, category: "us" },
    { name: "South Burlington", state: "VT", country: "USA", lat: 44.4670, lon: -73.1709, category: "us" },
    { name: "Rutland", state: "VT", country: "USA", lat: 43.6106, lon: -72.9726, category: "us" },
    { name: "Barre", state: "VT", country: "USA", lat: 44.1970, lon: -72.5020, category: "us" },
    { name: "Montpelier", state: "VT", country: "USA", lat: 44.2601, lon: -72.5754, category: "us" },

    // Virginia (VA)
    { name: "Virginia Beach", state: "VA", country: "USA", lat: 36.8529, lon: -75.9780, category: "us" },
    { name: "Chesapeake", state: "VA", country: "USA", lat: 36.7682, lon: -76.2875, category: "us" },
    { name: "Norfolk", state: "VA", country: "USA", lat: 36.8508, lon: -76.2859, category: "us" },
    { name: "Richmond", state: "VA", country: "USA", lat: 37.5407, lon: -77.4360, category: "us" },
    { name: "Newport News", state: "VA", country: "USA", lat: 37.0871, lon: -76.4730, category: "us" },

    // Washington (WA)
    { name: "Seattle", state: "WA", country: "USA", lat: 47.6062, lon: -122.3321, category: "us" },
    { name: "Spokane", state: "WA", country: "USA", lat: 47.6588, lon: -117.4260, category: "us" },
    { name: "Tacoma", state: "WA", country: "USA", lat: 47.2529, lon: -122.4443, category: "us" },
    { name: "Vancouver", state: "WA", country: "USA", lat: 45.6387, lon: -122.6615, category: "us" },
    { name: "Bellevue", state: "WA", country: "USA", lat: 47.6101, lon: -122.2015, category: "us" },

    // West Virginia (WV)
    { name: "Charleston", state: "WV", country: "USA", lat: 38.3498, lon: -81.6326, category: "us" },
    { name: "Huntington", state: "WV", country: "USA", lat: 38.4192, lon: -82.4452, category: "us" },
    { name: "Morgantown", state: "WV", country: "USA", lat: 39.6295, lon: -79.9559, category: "us" },
    { name: "Parkersburg", state: "WV", country: "USA", lat: 39.2667, lon: -81.5615, category: "us" },
    { name: "Wheeling", state: "WV", country: "USA", lat: 40.0640, lon: -80.7209, category: "us" },

    // Wisconsin (WI)
    { name: "Milwaukee", state: "WI", country: "USA", lat: 43.0389, lon: -87.9065, category: "us" },
    { name: "Madison", state: "WI", country: "USA", lat: 43.0731, lon: -89.4012, category: "us" },
    { name: "Green Bay", state: "WI", country: "USA", lat: 44.5192, lon: -88.0198, category: "us" },
    { name: "Kenosha", state: "WI", country: "USA", lat: 42.5847, lon: -87.8212, category: "us" },
    { name: "Racine", state: "WI", country: "USA", lat: 42.7261, lon: -87.7829, category: "us" },

    // Wyoming (WY)
    { name: "Cheyenne", state: "WY", country: "USA", lat: 41.1400, lon: -104.8202, category: "us" },
    { name: "Casper", state: "WY", country: "USA", lat: 42.8501, lon: -106.3252, category: "us" },
    { name: "Gillette", state: "WY", country: "USA", lat: 44.2911, lon: -105.5022, category: "us" },
    { name: "Laramie", state: "WY", country: "USA", lat: 41.3114, lon: -105.5911, category: "us" },
    { name: "Rock Springs", state: "WY", country: "USA", lat: 41.5875, lon: -109.2029, category: "us" },

    // Washington D.C.
    { name: "Washington", state: "DC", country: "USA", lat: 38.9072, lon: -77.0369, category: "us" },

    // Puerto Rico (PR)
    { name: "San Juan", state: "PR", country: "USA", lat: 18.4655, lon: -66.1057, category: "us" },
    { name: "Bayamón", state: "PR", country: "USA", lat: 18.3986, lon: -66.1557, category: "us" },
    { name: "Carolina", state: "PR", country: "USA", lat: 18.3808, lon: -65.9574, category: "us" },
    { name: "Ponce", state: "PR", country: "USA", lat: 18.0111, lon: -66.6141, category: "us" },
    { name: "Caguas", state: "PR", country: "USA", lat: 18.2341, lon: -66.0485, category: "us" }
];

/**
 * Helper to get a label for display (e.g. "Santa Fe, NM, USA" or "Tokyo, Japan")
 */
export function getCityDisplayName(city) {
    if (city.state) {
        return `${city.name}, ${city.state}, ${city.country}`;
    }
    return `${city.name}, ${city.country}`;
}

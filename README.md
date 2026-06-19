# EMR Simulator

A full-stack Electronic Medical Record (EMR) training system built with Express, SQLite, and session authentication. This simulator provides a realistic clinical documentation environment for training purposes.

## Features

- **Patient Management**: View, search, and manage patient records with detailed demographics
- **Clinical Documentation**:
  - Medications with dosage and instructions
  - Lab results and imaging studies
  - Orders (labs, imaging, consults, studies)
  - Consultations with specialty tracking
  - Problem list with status tracking and annotations
  - Physician notes with comprehensive clinical sections
  - Nursing notes with vital signs
  - Allergy tracking with drug allergy alerts
- **Status Management**: Click-to-change status for patients, orders, consultations, studies, and problems via dropdown menus
- **Authentication**: Session-based login system with password hashing
- **Responsive Design**: Clean, modern UI with Tabler icons

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jack-W-Fan/EMR-Simulator
   cd emr-simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory:
   ```
   SESSION_SECRET=your-secret-key-here
   PORT=3000
   ```

## Running the Application

1. **Start the server**
   ```bash
   npm start
   ```

2. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. **Default login**
   - Username: `demo`
   - Password: `demo123`

## Project Structure

```
emr-simulator/
├── public/
│   └── index.html          # Frontend application
├── routes/
│   └── patients.js         # API routes for patient operations
├── database.js             # SQLite database initialization
├── server.js               # Express server setup
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite (via sql.js)
- **Authentication**: express-session with bcryptjs for password hashing
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Icons**: Tabler Icons

## Database Schema

The application uses SQLite with the following tables:
- `patients` - Patient demographics and appointment info
- `medications` - Patient medications
- `orders` - Lab, imaging, consult, and study orders
- `consultations` - Consultation requests and results
- `studies` - Diagnostic studies and results
- `problems` - Patient problem list with status and annotations
- `physician_notes` - Comprehensive clinical documentation
- `nursing_notes` - Nursing documentation with vital signs
- `allergies` - Patient allergy tracking
- `imaging` - Medical imaging attachments

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:mr` - Get patient clinical data
- `PUT /api/patients/:mr` - Update patient info
- `DELETE /api/patients/:mr` - Delete patient
- `PUT /api/patients/:mr/status` - Update patient status

### Medications
- `GET /api/patients/:mr/medications` - Get patient medications
- `POST /api/patients/:mr/medications` - Add medication
- `DELETE /api/patients/:mr/medications/:id` - Delete medication

### Orders
- `GET /api/patients/:mr/orders` - Get patient orders
- `POST /api/patients/:mr/orders` - Add order
- `DELETE /api/patients/:mr/orders/:id` - Delete order
- `PUT /api/patients/:mr/orders/:id/status` - Update order status

### Consultations
- `GET /api/patients/:mr/consultations` - Get consultations
- `POST /api/patients/:mr/consultations` - Add consultation
- `DELETE /api/patients/:mr/consultations/:id` - Delete consultation
- `PUT /api/patients/:mr/consultations/:id/status` - Update consultation status

### Studies
- `GET /api/patients/:mr/studies` - Get studies
- `POST /api/patients/:mr/studies` - Add study
- `DELETE /api/patients/:mr/studies/:id` - Delete study
- `PUT /api/patients/:mr/studies/:id/status` - Update study status

### Problems
- `GET /api/patients/:mr/problems` - Get problems
- `POST /api/patients/:mr/problems` - Add problem
- `DELETE /api/patients/:mr/problems/:id` - Delete problem
- `PUT /api/patients/:mr/problems/:id/status` - Update problem status

### Physician Notes
- `GET /api/patients/:mr/physician-notes` - Get physician notes
- `POST /api/patients/:mr/physician-notes` - Add physician note
- `DELETE /api/patients/:mr/physician-notes/:id` - Delete physician note

### Nursing Notes
- `GET /api/patients/:mr/nursing-notes` - Get nursing notes
- `POST /api/patients/:mr/nursing-notes` - Add nursing note
- `DELETE /api/patients/:mr/nursing-notes/:id` - Delete nursing note

### Allergies
- `GET /api/patients/:mr/allergies` - Get allergies
- `POST /api/patients/:mr/allergies` - Add allergy
- `DELETE /api/patients/:mr/allergies/:id` - Delete allergy

### Imaging
- `GET /api/patients/:mr/imaging` - Get imaging
- `POST /api/patients/:mr/imaging` - Add imaging
- `DELETE /api/patients/:mr/imaging/:id` - Delete imaging

### Resetting the Database

To reset the database (delete all data):
1. Stop the server
2. Delete the `.db` file in the project root
3. Restart the server (database will be recreated)

## License

This project is for educational and training purposes.

## Support

For issues or questions, please open an issue on GitHub.

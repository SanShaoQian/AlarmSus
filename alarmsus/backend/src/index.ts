import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { Query } from 'express-serve-static-core';

const app = express();
const port = process.env.PORT || 3000;

// Database configuration
const pool = new Pool({
    user: 'postgres',
    password: 'QHCqhc200-100',
    host: 'localhost',
    port: 5432,
    database: 'alarmsus',
});

app.use(cors());
app.use(express.json());

interface TypedRequestQuery extends Request {
    query: {
        latitude?: string;
        longitude?: string;
        radius?: string;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Fetch nearby AEDs endpoint
const getNearbyAEDs: RequestHandler = async (req, res) => {
    try {
        const { latitude, longitude, radius } = req.query;
        
        if (!latitude || !longitude || !radius) {
            res.status(400).json({ 
                error: 'Missing required parameters: latitude, longitude, radius' 
            });
            return;
        }

        const radiusKm = Number(radius) / 1000; // Convert meters to kilometers
        
        const result = await pool.query(
            'SELECT * FROM fetch_nearby_aeds($1, $2, $3)',
            [Number(latitude), Number(longitude), radiusKm]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching nearby AEDs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

app.get('/api/aeds/nearby', getNearbyAEDs);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
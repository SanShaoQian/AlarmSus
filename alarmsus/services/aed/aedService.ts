import { AED } from '../../types/aed';

const API_URL = 'http://localhost:3000';

export async function fetchNearbyAEDs(latitude: number, longitude: number, radiusMeters: number): Promise<AED[]> {
    try {
        const response = await fetch(
            `${API_URL}/api/aeds/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radiusMeters}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch nearby AEDs');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching nearby AEDs:', error);
        return [];
    }
} 
import { useState, useEffect, useMemo } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';

const Boundary_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/boundaries/germany_bayern_boundaries.json';

const useBoundary = () => {
    const [boundaryData, setBoundaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Загрузка данных о границах
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(Boundary_URL);
                const data = await response.json();
                setBoundaryData(data);
            } catch (error) {
                console.error('Error loading regions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Создание слоя для границ баварии
    const createGlowLayer = (width, opacity, id) => {
        return new GeoJsonLayer({
            id: `border-glow-${id}`,
            data: boundaryData,
            filled: false,
            stroked: true,
            pickable: false,
            opacity: opacity,
            getLineColor: [0, 0, 0],
            lineWidthMinPixels: width,
            lineJointRounded: true,
            parameters: {
                blend: true,
                depthTest: true,
                blendFunc: [
                    WebGLRenderingContext.SRC_ALPHA,
                    WebGLRenderingContext.ONE_MINUS_SRC_ALPHA
                ]
            }
        });
    };
    return { boundaryData, isLoading, createGlowLayer };

};

export default useBoundary;
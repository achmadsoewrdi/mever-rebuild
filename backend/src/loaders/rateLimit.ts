import { FastifyInstance } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";

export const loadRateLimit = async (app: FastifyInstance) => {
    await app.register(fastifyRateLimit, {
        // global: false berarti rate limit tidak otomatis aktif di semua endpoint
        global: false,
        max:100,
        timeWindow:'1 minute',

        // kustomisasi error http 429
        errorResponseBuilder : function(request, context){
            return {
                statusCode: 429,
                error: 'Too Many Requests',
                message: 'Terlalu banyak permintaan. coba lagi nanti',
            };
        },
    });
    
    console.log("✅ Rate limit terhubung");
};
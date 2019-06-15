declare global {
    namespace Express {
        interface Request {
            user: {
                name: string;
            };
        }
    }
}
declare const app: import("express-serve-static-core").Express;
export default app;

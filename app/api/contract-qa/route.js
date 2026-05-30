00:18:03.666 Running build in Washington, D.C., USA (East) – iad1
00:18:03.667 Build machine configuration: 2 cores, 8 GB
00:18:03.796 Cloning github.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI (Branch: main, Commit: d7d3de5)
00:18:04.279 Cloning completed: 483.000ms
00:18:04.919 Restored build cache from previous deployment (EvY64YJPBrjD1TLMQsRfec88jyDE)
00:18:05.119 Running "vercel build"
00:18:05.139 Vercel CLI 54.4.1
00:18:05.351 Installing dependencies...
00:18:09.463 
00:18:09.463 up to date in 4s
00:18:09.464 
00:18:09.464 168 packages are looking for funding
00:18:09.464   run `npm fund` for details
00:18:09.496 Detected Next.js version: 14.2.35
00:18:09.503 Running "npm run build"
00:18:09.603 
00:18:09.604 > grievance-ai@0.1.0 build
00:18:09.604 > next build
00:18:09.604 
00:18:10.956   ▲ Next.js 14.2.35
00:18:10.957 
00:18:10.980    Creating an optimized production build ...
00:18:13.518 Failed to compile.
00:18:13.518 
00:18:13.518 ./app/api/contract-qa/route.js
00:18:13.518 Error: 
00:18:13.518   x Expression expected
00:18:13.518      ,-[/vercel/path0/app/api/contract-qa/route.js:299:1]
00:18:13.518  299 | 
00:18:13.519  300 | Answer thoroughly and in detail using the sections above:`;
00:18:13.519  301 | }
00:18:13.519  302 | }
00:18:13.519      : ^
00:18:13.519  303 | 
00:18:13.519  304 | // AI providers (same chain as analyze route)
00:18:13.519  305 | async function queryWithGroq(prompt) {
00:18:13.519      `----
00:18:13.519 
00:18:13.519 Caused by:
00:18:13.519     Syntax Error
00:18:13.519 
00:18:13.519 Import trace for requested module:
00:18:13.519 ./app/api/contract-qa/route.js
00:18:13.519 
00:18:13.530 
00:18:13.531 > Build failed because of webpack errors
00:18:13.562 Error: Command "npm run build" exited with 1

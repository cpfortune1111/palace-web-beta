import {preloadQuoteAssets} from './quote-animation.js?v=saturnQuote1';
import {ensureRouter,installAssetFetch} from './boot-router.js?v=02408r25';
export const presentationCharacters=['SailorVenus','SailorMoon','SailorJupiter','SailorNeptune','SailorSaturn'];
export async function ensurePresentationWorker(){
 await ensureRouter();installAssetFetch();
}
export async function preloadPresentationPack(progress=()=>{}){progress(1)}
export async function preloadPresentationPortraits(progress=()=>{}){
 const amounts=presentationCharacters.map(()=>0);await Promise.all(presentationCharacters.map((c,i)=>preloadQuoteAssets(c,['9000'],amount=>{amounts[i]=amount;progress(amounts.reduce((a,b)=>a+b,0)/amounts.length)})));progress(1);
}

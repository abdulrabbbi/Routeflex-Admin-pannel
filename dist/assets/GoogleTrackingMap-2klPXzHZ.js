import{r as o,j as w}from"./index-DDFCQUB-.js";import{L as d}from"./leaflet-DHXD0kNQ.js";import{I as k}from"./index-CUEGGqui.js";delete d.Icon.Default.prototype._getIconUrl;d.Icon.Default.mergeOptions({iconRetinaUrl:"/marker-icon-2x.png",iconUrl:"/marker-icon.png",shadowUrl:"/marker-shadow.png"});new d.DivIcon({className:"google-pin",html:`
    <svg width="46" height="64" viewBox="0 0 46 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M23 62c7-12.5 22-24 22-39C45 10.297 35.703 1 23 1S1 10.297 1 23c0 15 15 26.5 22 39z" fill="#EA4335"/>
        <circle cx="23" cy="23" r="8.5" fill="#fff"/>
      </g>
    </svg>
  `,iconSize:[46,64],iconAnchor:[23,60],tooltipAnchor:[0,-50]});new d.DivIcon({className:"blue-dot",html:`
    <div style="position:relative;width:44px;height:44px;">
      <div style="
        position:absolute;left:50%;top:50%;
        width:14px;height:14px;border-radius:50%;
        background:#1A73E8;transform:translate(-50%,-50%);
        box-shadow:0 0 0 6px rgba(26,115,232,0.25);
      "></div>
    </div>
  `,iconSize:[44,44],iconAnchor:[22,22]});new d.Icon({iconUrl:k.MapCar,iconSize:[40,40],iconAnchor:[20,20]});let m=null;function D(r){return window.google&&window.google.maps?Promise.resolve(window.google):m||(m=new Promise((t,c)=>{const e=document.createElement("script");e.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(r)}`,e.async=!0,e.defer=!0,e.onload=()=>t(window.google),e.onerror=()=>c(new Error("Failed to load Google Maps")),document.head.appendChild(e)}),m)}function b(r){const[t,c]=o.useState(!1),[e,p]=o.useState(null);return o.useEffect(()=>{let s=!0;return D(r).then(()=>s&&c(!0)).catch(l=>s&&p(l)),()=>{s=!1}},[r]),{ready:t,error:e}}const A=({route:r,currentLocation:t})=>{const c="AIzaSyAypydLOgqQvYYzrxf6XwgtnSX4r406c9E",{ready:e,error:p}=b(c),s=o.useRef(null),l=o.useRef(null),g=o.useRef(null),f=o.useRef(null),u=o.useMemo(()=>[t.lat,t.lng],[t.lat,t.lng]);return o.useEffect(()=>{if(!e||!s.current||l.current)return;const[a,i]=u,n=new window.google.maps.Map(s.current,{center:{lat:a,lng:i},zoom:15,mapTypeControl:!1,streetViewControl:!1,fullscreenControl:!1});l.current=n;const h=new window.google.maps.Marker({position:{lat:a,lng:i},map:n});g.current=h;const x=r.map(([y,M])=>({lat:y,lng:M})),v=new window.google.maps.Polyline({path:x,geodesic:!0,strokeColor:"#22c55e",strokeOpacity:1,strokeWeight:4,map:n});f.current=v},[e]),o.useEffect(()=>{if(!l.current||!g.current)return;const[a,i]=u,n=new window.google.maps.LatLng(a,i);g.current.setPosition(n),l.current.panTo(n)},[u[0],u[1]]),o.useEffect(()=>{if(!f.current||!l.current)return;const a=r.map(([i,n])=>({lat:i,lng:n}));f.current.setPath(a)},[r]),p?w.jsxDEV("div",{className:"p-4 border rounded-lg text-sm text-red-600",children:["Failed to load Google Maps: ",String(p.message||p)]},void 0,!0,{fileName:"D:/Desktop/MY projects/Routeflex-Admin-pannel/src/components/Maps/GoogleTrackingMap.tsx",lineNumber:84,columnNumber:7},void 0):w.jsxDEV("div",{className:"relative rounded-xl overflow-hidden shadow-sm border border-gray-200",children:w.jsxDEV("div",{ref:s,className:"h-[500px] w-full"},void 0,!1,{fileName:"D:/Desktop/MY projects/Routeflex-Admin-pannel/src/components/Maps/GoogleTrackingMap.tsx",lineNumber:92,columnNumber:7},void 0)},void 0,!1,{fileName:"D:/Desktop/MY projects/Routeflex-Admin-pannel/src/components/Maps/GoogleTrackingMap.tsx",lineNumber:91,columnNumber:5},void 0)};export{A as G};

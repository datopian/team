import React from 'react';

import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';

import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

// Data source
const DATA_URL = 'https://raw.githubusercontent.com/datopian/team/master/data/team.csv';

const MAP_VIEW = new MapView({repeat: true});
const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

function makeAvatarsCircleAndBnW(radius, src, success) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = radius * 2;
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin='anonymous';
  img.src = src;
  return new Promise((resolve, reject) => {
    img.onload = function() {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // grayscale images so that all avatars are in black&white
      let imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      let pixels = imgData.data;
      for (var i = 0; i < pixels.length; i += 4) {
        let lightness = parseInt(pixels[i]*.299 + pixels[i + 1]*.587 + pixels[i + 2]*.114);
        pixels[i] = lightness;
        pixels[i + 1] = lightness;
        pixels[i + 2] = lightness;
      }
      ctx.putImageData(imgData, 0, 0);
      // we use compositing, offers better antialiasing than clip()
      ctx.globalCompositeOperation = 'destination-in';
      ctx.arc(radius, radius, radius, 0, Math.PI*2);
      ctx.fill();
      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
  })
}

/* eslint-disable react/no-deprecated */
export default function App({data}) {
  const dataWithAvatarsLoaded = Promise.all(data.map(async (item) => {
    let avatarDataUrl = item.avatar;
    try {
      avatarDataUrl = await makeAvatarsCircleAndBnW(64, item.avatar);
    } catch(e) {
      console.error(e);
    }
    return { ...item, avatarDataUrl };
  }));

  const layer = new IconLayer({
    id: 'icon',
    data: dataWithAvatarsLoaded,
    pickable: true,
    getIcon: d => ({
      url: d.avatarDataUrl,
      width: 128,
      height: 128
    }),
    getSize: d => 35,
    getPosition: d => [d.lng, d.lat],
    sizeScale: 1
  });

  const tooltip = ({object}) => object && {
    html: `<h4 style="margin: 0">${object.fullname}</h4><br /><img src="${object.avatarDataUrl}" width=120 /><br /><br />${object.position}<br />${object.country}`,
    style: {
      backgroundColor: '#fff',
      fontSize: '16px',
      'text-align': 'center'
    }
  }

  return (
    <>
      <DeckGL
        views={MAP_VIEW}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[layer]}
				getTooltip={tooltip}
      >
        <StaticMap reuseMaps mapStyle={MAP_STYLE} preventStyleDiffing={true} />
      </DeckGL>
    </>
  );
}

export function renderToDOM(container) {
  load(DATA_URL, CSVLoader, {csv: {skipEmptyLines: true}})
    .then((team) => {
      render(<App data={team} />, container);
    });
}
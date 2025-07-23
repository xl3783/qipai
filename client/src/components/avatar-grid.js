import { View, Text } from '@tarojs/components';
import { createSelectorQuery, useReady } from '@tarojs/taro';
import Avatar from './Avatar';
import { useState, useRef, useEffect } from 'react';


export default function AvatarGrid({
    players,
    gridColumns,
}) {


    const [width, setWidth] = useState(0);
    const containerRef = useRef(null);
  
  
    useReady(() => {
        const query = createSelectorQuery();
        query.select('#players-grid').boundingClientRect(rect => {
          if (rect) {
            console.log(rect);
            const cellWidth = (rect.width - (gridColumns - 1) * 10) / gridColumns;
            setWidth(cellWidth);
          }
        }).exec();
      });



    return (
        <View id="players-grid" ref={containerRef} style={{ display: 'grid', 
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`, 
            gap: '10px',
            width: '100%',
            padding: '0 10px',
            alignContent: 'center', 
            justifyContent: 'center'
          }}>
        {
          players.map((player) => (
            <View key={player.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar src={player.avatar} size={width*0.8} />
              <Text>{player.name}</Text>
              <Text>{player.score}</Text>
            </View>
          ))
        }
        </View>
    )
}
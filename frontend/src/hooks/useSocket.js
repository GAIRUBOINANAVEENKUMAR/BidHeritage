import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export default function useSocket(itemId) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [latestBid, setLatestBid] = useState(null)
  const [bidHistory, setBidHistory] = useState([])

  useEffect(() => {
    if (!itemId) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join_auction', itemId)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('bid_update', (data) => {
      setLatestBid(data)
      setBidHistory((prev) => [data, ...prev])
    })

    socket.on('bid_error', (error) => {
      console.error('Bid error:', error)
    })

    return () => {
      socket.emit('leave_auction', itemId)
      socket.disconnect()
    }
  }, [itemId])

  const placeBid = useCallback(
    (bidData) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('place_bid', {
          itemId,
          ...bidData,
        })
      }
    },
    [itemId]
  )

  return {
    connected,
    latestBid,
    bidHistory,
    placeBid,
    socket: socketRef.current,
  }
}

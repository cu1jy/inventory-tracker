'use client' //client side app
import Image from "next/image"
import { useState, useEffect } from 'react'
import { firestore } from "@/firebase"
import { Box, Modal, Stack, TextField, Typography, Button } from "@mui/material"
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from "firebase/firestore"
//in this project, because we're using material ui (component library, we're not using any css)

export default function Home() {
  const [inventory, setInventory] = useState([])
  //modal - add/remove
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('') //default values
  const [search, setSearch] = useState('')

  const itemNameFormatting = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  //fetch inventory from firebase
  const updateInventory = async () => { //async prevents your fetch from blocking your code - website won't freeze when fetching
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => { //for every doc, we want to add it to our inventory list
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item) //gets us a direct item reference
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }

    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item) //gets us a direct item reference
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        //delete item
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }

    await updateInventory()
  }

  //runs the code inside whenever something inside the dependency changes
  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
      bgcolor="white"
      color="black">
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: 'translate(-50%, -50%)'
          }}
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          color="black"
        >
          <Typography variant="h6">Add item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              varient='outlined'
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(itemNameFormatting(e.target.value))
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal >
      <Button variant="contained" onClick={() => {
        handleOpen()
      }}>
        Add New Item
      </Button>
      <Box border='1px solid #333'>
        <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <TextField variant="outlined" fullWidth height="100px" label="Search for items"
          onChange={(e) => setSearch(e.target.value)}>
        </TextField>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {
            inventory.filter(({ name }) => {
              return search.toLowerCase() === '' ? name : name.toLowerCase().includes(search.toLowerCase());
            }).map(({ name, quantity }) => (
              <Box key={name} width="100%" minHeight="150px" display="flex" alignItems="center" justifyContent="space-between" bgcolor="white" padding={5}>
                <Typography variant="h3" color="#333" textAlign="center">
                  {itemNameFormatting(name)}
                </Typography>
                <Typography variant="h3" color="#333" textAlign="center">
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={() => {
                    addItem(name);
                  }}>
                    Add
                  </Button>
                  <Button variant="contained" onClick={() => {
                    removeItem(name);
                  }}>
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))
          }
        </Stack>
      </Box>
    </Box >
  )
}

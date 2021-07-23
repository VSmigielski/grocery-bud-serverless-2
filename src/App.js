import React, { useEffect, useState } from "react";
import { EasybaseProvider, useEasybase } from 'easybase-react';
import ebconfig from "./ebconfig";
import {ImSpinner} from 'react-icons/im'
import {FaTrash} from 'react-icons/fa'
import {FaEdit} from 'react-icons/fa'

export default function App() {
  return (
    <EasybaseProvider ebconfig={ebconfig}>
      <Example />
    </EasybaseProvider>
  );
}

function Example() {
  const { db, useReturn } = useEasybase();
  const [name, setName] = useState('');
  const [alert, setAlert] = useState({show:false, msg:'',type:''});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      // display alert
      showAlert(true, 'danger', 'Please enter a value')
    } else {
      // show alert
      // add item to list
      showAlert(true, 'success', 'Item Added to the List')
      setName('');
    }
  }

  const showAlert = (show=false, type="", msg="") => {
    setAlert({show, type, msg})
  }

  const editItem = () => {
    showAlert(true, 'success', `Item has been edited`)
  }

  const clearList = () => {
    showAlert(true, 'danger', 'Emptied List')
  }

  const removeItem = (id) => {
    showAlert(true, 'danger', 'Item has been removed');
  }

  const { frame, loading } = useReturn(() => db('GROCERYLIST')
    .return()                           // Select query
    .limit(50));                         // Limit how many items are shown

  if (loading) return <ImSpinner />
  return (
    <>
    <section className="section-center">
      <form className="grocery-form" onSubmit={handleSubmit}>
        {alert.show && <Alert {...alert} removeAlert={showAlert}/>}
        <h3>Grocery Buddy</h3>
        <div className="form-control">
          <input type="text" className="grocery" placeholder="Ex. Eggs" value={name} onChange={(e) => setName(e.target.value)}/>
          <NewGroceryButton name={name}/>
        </div>
      </form>

      <div className="grocery-container">
        {frame.map(ele => <Card {...ele} removeItem={removeItem} editItem={editItem}/>)}
        <ClearItems clearList={clearList}/>
      </div>
    </section>
    </>
  )
}

function Card({ title, _key, removeItem, editItem }){
  const { db } = useEasybase();

  const handleDelete = async () => {
    await db('GROCERYLIST').delete().where({ _key }).one();
    removeItem();
  }

  const handleEdit = async () => {
    /* const singleRecord = db('GROCERYLIST').return().where(e.like('title', title)).one() */
    const newName = prompt("Enter the new name for the item: ")

    await db('GROCERYLIST').where({ _key: _key }).set({ title: newName }).one()
    editItem();
  }

  return (
    <div>
      <article key={_key} className="grocery-item">
          <p className="title">{title}</p>
          <div className="btn-container">
            <button onClick={handleEdit} type="button" className="edit-btn"><FaEdit/></button>
            <button onClick={handleDelete} type="button" className="delete-btn"><FaTrash></FaTrash></button>
          </div>
      </article>
    </div>
  )
}

function ClearItems({clearList}) {
    const { db } = useEasybase();

    const handleClear = async () => {
      await db('GROCERYLIST').delete().all();
      clearList();
    }

  return <button className="clear-btn" onClick={handleClear}>Clear Items</button>
}

function NewGroceryButton({name}) {
  const { db } = useEasybase();

  const handleAdd = async () => {
    if (!name) {

    } else {
      await db('GROCERYLIST').insert({ title: name }).one()
    }
  }

  return <button onClick={handleAdd} type="submit" className="submit-btn">Submit</button>
}

const Alert = ({type, msg, removeAlert, list}) => {
  useEffect(() => {
      const timeout = setTimeout(() => {
          removeAlert();
      }, 3000)
      return () => clearTimeout(timeout)
  }, [list, removeAlert])
return (
    <>
      <p className={`alert alert-${type}`}>{msg}</p>
    </>
)
}
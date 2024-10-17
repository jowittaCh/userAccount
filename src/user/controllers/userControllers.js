const express = require('express');
const { Request, Response } =require('express');
const {createUser , logInUser ,updateUserInfo, updatePassword, fetchUserInfo , deleteUser, getAccessToken, } =require("../services/userServices");
const jwt = require('jsonwebtoken');
const userError = require("../../../error");

const signUp = async(req,res)=>{
    try{
        console.log("im in signUp controller function");
        const result = await createUser(req);
        res.status(200).send(result);
    }
    catch(error){
       res.status(error.statusCode || 400).json({
           message: error.message,
       });
    }
   };
 
const signIn = async(req,res)=>{
    try{
        console.log("im in signIn controller function");
        const result = await logInUser(req);
        res.status(200).send(result);
    }
    catch(error){
       res.status(error.statusCode || 400).json({
           message: error.message,
       });
    }
   };


const userInfo = async(req,res)=>{
    try{
        console.log("im in user info controller function");
        const result = await fetchUserInfo(req);
        res.status(200).send(result);
    }
    catch(error){
       res.status(error.statusCode || 400).json({
           message: error.message,
       });
    }
   };

const updateInfo = async(req,res)=>{
    try{
        console.log("im in update controller function");
        const result = await updateUserInfo(req);
        res.status(200).send(result);
    }
    catch(error){
       res.status(error.statusCode || 400).json({
           message: error.message,
       });
    }
   };

const changePassword = async(req,res)=>{
try{
    console.log("im in change password controller function");
    const result =await updatePassword(req);
    res.status(200).send(result);
}
catch(error){
    res.status(error.statusCode || 400).json({
        message: error.message,
    });
}
};

const deleteAcc = async(req,res)=>{
    try{
        console.log("im in delete controller function");
        const result = await deleteUser(req);
        res.status(200).send(result);
    }
    catch(error){
       res.status(error.statusCode || 400).json({
           message: error.message,
       });
    }
   };

   const getAccess=async(req,res)=>{
    try{
const result=await getAccessToken(req);
 res.status(200).send(result);
    }
    catch(error){
        res.status(error.statusCode || 400).json({
            message: error.message,
        });
    }
 }

   module.exports={
    signUp,
    signIn,
    updateInfo,
    userInfo,
    deleteAcc,
    getAccess,
    changePassword,
   } ;
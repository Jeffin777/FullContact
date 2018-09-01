const Contact = require("../models/contact");
var fetch = require('node-fetch');

exports.createContact = (req, res, next) => {
  let imagePath = req.body.image;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const contact = new Contact({
    fname:   req.body.fname,
    lname:   req.body.lname,
    email:   req.body.email,
    phone:   req.body.phone,
    org:     req.body.org,
    title:   req.body.title,
    desc:    req.body.desc,
    image:   imagePath,
    creator: req.userData.userId
  });
  contact.save()
    .then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          ...createdPost,
          id: createdPost._id
        }
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Creating a post failed!"
      });
    });
};

exports.updateContact = (req, res, next) => {
  let imagePath = req.body.image;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const contact = new Contact({
    _id:     req.params.id,
    fname:   req.body.fname,
    lname:   req.body.lname,
    email:   req.body.email,
    phone:   req.body.phone,
    org:     req.body.org,
    title:   req.body.title,
    desc:    req.body.desc,
    image:   imagePath,
    creator: req.userData.userId
  });
  
  Contact.updateOne({ _id: req.params.id, creator: req.userData.userId }, contact)
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Couldn't udpate post!"
      });
    });
};

exports.getContacts = (req, res, next) => {

  let fetchedContacts;
  Contact.find().then(documents => {
      fetchedContacts = documents;
      res.status(200).json({
        message: "Posts fetched successfully!",
        contacts: fetchedContacts
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
};

exports.SearchContacts = (req, res, next) => {

  let regex = new RegExp(req.params.id,"i");
  let fetchedContacts;
  Contact.find(
    { 
      $or: [
        {fname: regex},
        {lname: regex}
     ]
    })
    .then(documents => {
      fetchedContacts = documents;
      res.status(200).json({
        message: "Search Completed successfully!",
        contacts: fetchedContacts
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Search Failed failed!"
      });
    });
};

exports.getContact = (req, res, next) => {
    Contact.findById(req.params.id)
    .then(contact => {
      if (contact) {
        res.status(200).json(contact);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching post failed!"
      });
    });
};

exports.EnrichApiSearch = (req, res, next) => {

    fetch('https://api.fullcontact.com/v3/person.enrich',{
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + process.env.ENRICH_API
      },
      body: JSON.stringify({
        "email": req.params.id
      })
    }).then((res) => {
      return res.json();
    })
    .then((json) => {      
        res.status(200).json({
          message: "Search Completed Succesfully!",
          info: json
        });
    })    
    .catch(error => {
        res.status(500).json({
          message: "Search failed!"
        });
    });

};

exports.deleteContact = (req, res, next) => {
  Contact.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then(result => {
      if (result.n > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: "Deleting posts failed!"
      });
    });
};

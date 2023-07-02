# FinaSeed-Assessment
Api for creating, reading, updating and deleting of users. There are endpoints for all these operations. This api also implements authentcation, therefore allowing only logged in users to perform some operations.


*** C - Creation Operation ***
To create a new user send a post request to the '/api/users/new' route. Body content should be a json file of this format

{
    "name": "john doe",
    "email": "johndoe@example.com",
    "password": "example1234",
    "confirmPassword": "example1234"
}

*** R - Read Operation ***
To read all users in the database send a get request to the '/users' route. If you wish to read users using certain criteria, the attach a json file like this

{
    "name": "John"
}

this will read the database for user with the name 'john' not 'johnny' or 'john walker'

To query the database for a single user, get the ID of the user and send a get request to the '/api/users/652735vhfg555265' route.
where '652735vhfg555265' is the user's ID

*** U - Update Operation ***
To update a user get the user's ID and send a patch request to the '/api/users/652735vhfg555265' route.
where '652735vhfg555265' is the user's ID and body should be a json file of this format

{
    "name": "John Walker",
    "email": "johnwalker@gmail.com"
}

*** D - Delete Operation ***
To delete a user get the user's ID and send a delete request to the '/api/users/652735vhfg555265' route.
where '652735vhfg555265' is the user's ID

*** Reset User's Password ***
To reset a users password send post request with a json file containing the user's email to '/api/users/reset'
eg.
{
    "email": "johndoe@example.com"
}

Then send a patch request to the link provided with another json file bearing your new password
eg.
{
    "password": "newPassword",
    "confirmPassword": "newPassword"
}
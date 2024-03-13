Swivl Assignment
Problem Statement -
Write a api in nodeJS with express server to handle below user
input, api should validate all fields as per validation provided below
in the table. If all validation success save the data in database
using mySQL (if possible use prisma for database operations
handling), if data saved successfully save pdf document with these
fields and return document path in api response else throw exact
error of failing transection.
KeyValueValidation
FirstName -- User inputValue must be string and not
contain any special character
LastName -- User inputValue must be string and not
contain any special character
phoneNumber -- UserinputValue must be string which
have “+” symbol as rst letter
and length will be in between
12 to 14
emailAddress -- User inputValue must be valid email
address

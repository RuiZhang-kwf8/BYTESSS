import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Adjust the path if needed
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import * as Contacts from 'expo-contacts';
import {
    FlatList, 
    StyleSheet,
    Text,
    View, 
    Image, 
    TextInput,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Button
  } from 'react-native';

const ProfileScreen = ({ route }) => {
  const { name } = route.params;
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactPermission, setContactPermission] = useState(null); // State to track permission status
  const [searchValue, setSearchValue] = useState("");
  const [global, setGlobal] = useState([]);

   const handleSearch = () => {
    if (searchValue.trim() != "") {
        const filteredContacts = global.filter(contact =>
            contact.firstName &&
            contact.firstName.trim().toLowerCase().includes(searchValue.trim().toLowerCase())
          );        
          setContacts(filteredContacts);
    }
    else {
        setContacts(global);
 
    }
}

  const fetchContactsAsync = () => {
    return new Promise((resolve, reject) => {
      Contacts.getAll((err, contacts) => {
        if (err) {
          reject(err);
        } else {
          resolve(contacts);
        }
      });
    });
  };


  useEffect(() => {
    const fetchUser = async (name) => {

      const userQuery = query(ref(db, 'users'), orderByChild('username'), equalTo(name));

      try {
        const snapshot = await get(userQuery);
        if (snapshot.exists()) {
          const userData = snapshot.val();

          // Check if the 'friends' array exists and is empty
          console.log("ight");
        
          const userId = Object.keys(userData)[0];
          const user = userData[userId];
          console.log('Processed User Data:', userData);
          console.log('Processed User Data:', user);
    
          // Ensure the 'friends' key exists
          if (!user.friends) {
            const { status } = await Contacts.requestPermissionsAsync();
            setContactPermission(status); // Update permission status state
            console.log("ight1");
            if (status === 'granted') {
                console.log("asd"); 
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image]
                  });
                  setContacts(data);
                  setGlobal(data); 
                  console.log(JSON.stringify(data, null, 2));
                }

        } 
      }
     } catch (error) {
      }
    };

    fetchUser(name);
  }, [name]);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
    <View style={styles.container}>
      <Text>This is {name}'s profile</Text>

      {users.map((user, index) => (
        <Text key={index}>{user.username}</Text>
      ))}

      <Text>Device Contacts:</Text>
      <TextInput
  style={styles.input}
  placeholder="Search by first name"
  value={searchValue}
  onChangeText={setSearchValue}
/>
      <Button title="Search" onPress={() => handleSearch()} />

      {contactPermission === 'granted' ? (
        
          contacts.map((contact, index) => (
            <View key={index}>
              {contact.phoneNumbers ? (
                contact.phoneNumbers.map((phoneNumber, numIndex) => (
                  <Text key={`${index}-${numIndex}`}>
                  </Text>
                ))
              ) : (
                <Text></Text>
              )}
              {contact.image ? (
                 <View>
                 <Image
                 style={styles.contactImage}
                 source={{ uri: contact.image.uri }}
               />
               </View>

              ) : (
                <Text></Text>
              )}
              <Text>{contact.firstName}</Text>
              
            </View>
          ))
      ) : (
        <Text>Contacts permission not granted.</Text>
      )}
    </View>

    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    backgroundColor: 'white',
    marginHorizontal: 20,
  },
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    width: '80%',
  }
});

export default ProfileScreen;

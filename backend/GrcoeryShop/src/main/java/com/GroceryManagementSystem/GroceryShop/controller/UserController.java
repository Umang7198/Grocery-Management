package com.GroceryManagementSystem.GroceryShop.controller;

import com.GroceryManagementSystem.GroceryShop.dto.ChangePasswordDTO;
import com.GroceryManagementSystem.GroceryShop.model.User;
import com.GroceryManagementSystem.GroceryShop.services.UserServices;
import com.GroceryManagementSystem.GroceryShop.utils.ResponseApi;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.GroceryManagementSystem.GroceryShop.dto.LoginDTO;

import java.util.List;


@RestController
@RequestMapping("/api")
@CrossOrigin
public class UserController {

    @Autowired
    private UserServices service;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);

    @GetMapping("/{id}")
    public ResponseApi<User> getUserById(@PathVariable long id){
        User user = service.getUserById(id);
        if(user == null){
            return new ResponseApi<>("User Not Found", false);
        }
        else{
            return new ResponseApi<>("Success", user, true);
        }

    }

    @GetMapping("/getUsers")
    public ResponseApi<List<User>> getAllUser(){
        List<User> list = service.getAllUser();
        if(list.isEmpty()){
            return new ResponseApi<>("Failed", false);
        }
        else{
            return new ResponseApi<>("Success", list, true);
        }
    }

    @PostMapping("/auth/signup")
    public ResponseEntity<ResponseApi<User>> registerUser(@RequestBody User user){
        user.setPassword(this.bCryptPasswordEncoder.encode(user.getPassword()));
        User registeredUser = service.registerUser(user);
        if(registeredUser == null)
            return ResponseEntity.ok(new ResponseApi<>("User already registered with this Email Id", null, false));

        return ResponseEntity.ok(new ResponseApi<>("Successfully Registered", user, false));

    }

    @PostMapping("/auth/login")
    public ResponseEntity<ResponseApi<LoginDTO>> userLogin(@RequestBody User user , HttpServletResponse response){

        String token = this.service.validateUser(user);
        System.out.println(token);
        if(token.equals("FAIL")){
            ResponseApi<LoginDTO> res = new ResponseApi<>("User Not Found", null, false);
            return ResponseEntity.ok(res);
        }else if(token.equals("INVALID")){
            ResponseApi<LoginDTO> res = new ResponseApi<>("Invalid Username and password", null, false);
            return ResponseEntity.ok(res);
        }
        else{

            response.setHeader("Authorization", "Bearer " + token);
            User loggedUser = service.getByEmailId(user.getEmail());
            LoginDTO ld = new LoginDTO(loggedUser,"Bearer " + token);
            System.out.println(loggedUser);

            ResponseApi<LoginDTO> res = new ResponseApi<>("SUCCESS", ld, true);
            return ResponseEntity.ok(res);
        }
    }


    @PutMapping("/update/{id}")
    public ResponseApi<User> updateUser(@PathVariable long id, @RequestBody User user){
        if(service.checkIfIsUserExist(id)){
            User updateUser = service.updateDetailsOfUser(user);
            return new ResponseApi<>("Success", updateUser, true);

        }else{
            return new ResponseApi<>("User Not Found", false);
        }
    }

    @PostMapping("/changePassword")
    public ResponseEntity<ResponseApi<User>> updatePassword(@RequestBody ChangePasswordDTO changePasswordDTO){
        System.out.println(changePasswordDTO.getOldPassword() + " " + changePasswordDTO.getId());
        User user = service.updatePassword(changePasswordDTO);
        if(user != null){
            return ResponseEntity.ok(new ResponseApi<>("Successfully Updated", user, true));
        }

        return ResponseEntity.ok(new ResponseApi<>("Successfully failed", null, false));
    }
}

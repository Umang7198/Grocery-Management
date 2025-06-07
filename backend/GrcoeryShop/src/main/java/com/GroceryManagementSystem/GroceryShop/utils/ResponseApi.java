package com.GroceryManagementSystem.GroceryShop.utils;

public class ResponseApi<T> {

    private String message;

    private boolean isSuccess;

    private T data;

    public ResponseApi( String message, boolean isSuccess) {
        this.isSuccess = isSuccess;
        this.message = message;
    }

    public ResponseApi(String message, T data, boolean isSuccess) {
        this.isSuccess = isSuccess;
        this.data = data;
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String isMessageSuccess) {
        this.message = message;
    }

    public boolean getIsSuccess() {
        return isSuccess;
    }

    public void setIsSuccess(boolean isSuccess) {
        this.isSuccess = isSuccess;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}

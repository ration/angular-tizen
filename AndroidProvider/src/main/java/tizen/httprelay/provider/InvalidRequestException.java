package tizen.httprelay.provider;

public class InvalidRequestException extends Exception {
    public InvalidRequestException(Throwable e) {
        super(e);
    }

    public InvalidRequestException(String msg) {
        super(msg);
    }
}

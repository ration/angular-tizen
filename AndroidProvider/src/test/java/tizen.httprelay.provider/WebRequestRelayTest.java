package tizen.httprelay.provider;


import org.junit.Assert;
import org.junit.Test;

public class WebRequestRelayTest {

    @Test()
    public void testHttpRequest() throws Exception {
        WebRequestRelay relay = new WebRequestRelay();
        String address = "www.google.com\n";
        String port = "80\n";
        String request = "GET / HTTP/1.1\r\n" +
                "Host: www.google.com\r\n" +
                "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0\n\n" +
                "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n" +
                "Accept-Language: en-US,en;q=0.5\r\n" +
                "Accept-Encoding: gzip, deflate, br\r\n" +
                "Connection: keep-alive\r\n" +
                "Cache-Control: max-age=0\r\n" +
                "\r\n";
        StringBuilder b = new StringBuilder();
        b.append(address).append(port).append(request);
        byte[] response = relay.httpRequest(b.toString().getBytes());
        String str = new String(response);
        Assert.assertTrue(str.contains("HTTP/"));
    }
}

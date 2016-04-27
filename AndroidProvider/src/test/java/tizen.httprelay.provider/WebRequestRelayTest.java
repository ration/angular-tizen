package tizen.httprelay.provider;


import android.content.Context;
import com.android.volley.ExecutorDelivery;
import com.android.volley.Network;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.ResponseDelivery;
import com.android.volley.toolbox.BasicNetwork;
import com.android.volley.toolbox.DiskBasedCache;
import com.android.volley.toolbox.HurlStack;
import com.google.common.util.concurrent.SettableFuture;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricGradleTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

import java.io.File;
import java.util.Collections;
import java.util.TreeMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;

@RunWith(RobolectricGradleTestRunner.class)
@Config(constants = BuildConfig.class)
public class WebRequestRelayTest {

    private WebRequestRelay relay;

    @Before
    public void setup() {
        relay = new WebRequestRelay(newRequestQueueForTest(RuntimeEnvironment.application));
    }


    @Test(timeout = 15000)
    public void testJsonP() throws InvalidRequestException, ExecutionException, InterruptedException {

        final CountDownLatch signal = new CountDownLatch(1);
        VolleyCallback cb = new VolleyCallback() {
            @Override
            public void onSuccess(JSONObject ans) {
                signal.countDown();
            }

            @Override
            public void onError(JSONObject error) {
                signal.countDown();
            }
        };
        String url = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=http%3A%2F%2Fwww.juvenes.fi%2Ftabid%2F1156%2Fmoduleid%2F3302%2FRSS.aspx";
        relay.httpRequest(Request.Method.GET, url, Collections.EMPTY_MAP, null, cb);
        signal.await();
    }


    @Test(timeout = 15000)
    public void testJSONObjectRequest() throws InvalidRequestException, ExecutionException, InterruptedException, JSONException {
        String url = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=http%3A%2F%2Fwww.juvenes.fi%2Ftabid%2F1156%2Fmoduleid%2F3302%2FRSS.aspx";
        JSONObject obj = new JSONObject();
        obj.put("method", "GET");
        obj.put("url", url);
        JSONObject jsonObject = doRequestAndWait(obj);
        Assert.assertTrue(jsonObject.has("response"));
    }


    @Test(timeout = 10000)
    public void testPOST() throws JSONException, InvalidRequestException, InterruptedException, ExecutionException {
        String req = "{\"method\":\"POST\",\"url\":\"http://koti.kapsi.fi/~talahtel/json/echo.cgi\",\"headers\":{\"Accept\":\"application/json, text/plain, */*\"}}";
        JSONObject obj = new JSONObject(req);
        JSONObject replyObject = doRequestAndWait(obj);

        Assert.assertTrue(replyObject.has("response"));
        Assert.assertTrue(replyObject.get("code").equals(200));
        Assert.assertTrue(replyObject.has("headers"));
    }

    @Test(timeout = 10000)
    public void testPOSTwithHeaders() throws JSONException, InterruptedException, ExecutionException, InvalidRequestException {
        String req = "{\"method\":\"POST\",\"url\":\"http://koti.kapsi.fi/~talahtel/json/echo.cgi\",\"headers\":{\"Accept-Language\":\"Finnish\",\"Accept\":\"application/json, text/plain, */*\"},\"data\":\"{\\\"test\\\":\\\"should echo 1\\\"}\"}";

        JSONObject obj = new JSONObject(req);
        JSONObject replyObject = doRequestAndWait(obj);

        Assert.assertTrue(replyObject.has("response"));
        Assert.assertTrue(replyObject.get("code").equals(200));
        Assert.assertTrue(replyObject.has("headers"));
        TreeMap<String, String> headers = (TreeMap<String, String>) replyObject.get("headers");
        Assert.assertEquals("Magic", headers.get("Custom-Token"));
        Assert.assertEquals("Finnish", headers.get("Accept-Lang"));
    }

    private JSONObject doRequestAndWait(JSONObject request) throws InterruptedException, InvalidRequestException, ExecutionException {
        final SettableFuture<JSONObject> reply = SettableFuture.create();
        VolleyCallback cb = new VolleyCallback() {
            @Override
            public void onSuccess(JSONObject ans) {
                reply.set(ans);
            }

            @Override
            public void onError(JSONObject err) {
                reply.set(err);
            }
        };

        relay.jsonRequest(request, cb);
        return reply.get();
    }

    private static RequestQueue newRequestQueueForTest(final Context context) {
        final File cacheDir = new File(context.getCacheDir(), "volley");

        final Network network = new BasicNetwork(new HurlStack());

        final ResponseDelivery responseDelivery = new ExecutorDelivery(Executors.newSingleThreadExecutor());

        final RequestQueue queue =
                new RequestQueue(
                        new DiskBasedCache(cacheDir),
                        network,
                        4,
                        responseDelivery);

        queue.start();

        return queue;
    }


}

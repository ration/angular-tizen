package tizen.httprelay.provider;


import android.content.Context;
import com.android.volley.ExecutorDelivery;
import com.android.volley.Network;
import com.android.volley.RequestQueue;
import com.android.volley.ResponseDelivery;
import com.android.volley.toolbox.BasicNetwork;
import com.android.volley.toolbox.DiskBasedCache;
import com.android.volley.toolbox.HurlStack;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.robolectric.RobolectricGradleTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

import java.io.File;
import java.util.Collections;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;

@RunWith(RobolectricGradleTestRunner.class)
@Config(constants = BuildConfig.class)
public class WebRequestRelayTest {

    private WebRequestRelay relay;
    private JSONObject reply = new JSONObject();

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
            public void onError(String string) {
                signal.countDown();
            }
        };
        String url = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=http%3A%2F%2Fwww.juvenes.fi%2Ftabid%2F1156%2Fmoduleid%2F3302%2FRSS.aspx";
        relay.httpRequest(url, Collections.EMPTY_MAP, cb);
        signal.await();
    }


    @Test(timeout = 15000)
    public void testJSONObjectRequest() throws InvalidRequestException, ExecutionException, InterruptedException, JSONException {
        String url = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=http%3A%2F%2Fwww.juvenes.fi%2Ftabid%2F1156%2Fmoduleid%2F3302%2FRSS.aspx";
        JSONObject obj = new JSONObject();
        obj.put("method", "GET");
        obj.put("url", url);

        final CountDownLatch signal = new CountDownLatch(1);
        VolleyCallback cb = new VolleyCallback() {
            @Override
            public void onSuccess(JSONObject ans) {
                signal.countDown();
                reply = ans;
            }

            @Override
            public void onError(String string) {
                signal.countDown();
            }
        };

        relay.jsonRequest(obj, cb);
        signal.await();
        Assert.assertTrue(reply.has("response"));
    }


    public static RequestQueue newRequestQueueForTest(final Context context) {
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

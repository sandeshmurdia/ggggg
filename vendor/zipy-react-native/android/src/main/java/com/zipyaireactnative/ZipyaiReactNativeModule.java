package com.zipyaireactnative;

import android.app.Activity;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.EditText;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import android.graphics.Rect;

import android.content.Context;
import android.provider.Settings;

import android.content.Context;
import android.os.Build;
import android.util.DisplayMetrics;
import android.view.WindowManager;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import static android.provider.Settings.Secure.getString;

import android.app.ActivityManager;
import android.content.res.Configuration;
import android.os.BatteryManager;
import android.os.Environment;
import android.os.StatFs;
import java.io.RandomAccessFile;
import java.math.BigInteger;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;

import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.Thread;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.LinkedHashMap;
import android.os.Looper;

import android.os.SystemClock;

import java.util.LinkedHashMap;

import android.content.SharedPreferences;
import androidx.work.Data;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.MediaType;
import okhttp3.Response;
import android.os.Process;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import java.util.concurrent.TimeUnit;

import com.github.anrwatchdog.ANRWatchDog;
import com.zipyaireactnative.ZipyaiReactNativeModule.ANRLogWorker;

import android.os.HandlerThread;
import android.view.PixelCopy;
import java.io.ByteArrayOutputStream;
import java.util.concurrent.CountDownLatch;


@ReactModule(name = ZipyaiReactNativeModule.NAME)
public class ZipyaiReactNativeModule extends ReactContextBaseJavaModule {
    public static final String NAME = "ZipyaiReactNative";
    private static final String TAG = "ZipyaiReactNative";
    private static final String HANDLER_NAME = "ZipyExceptionHandler";
    private static final String CRASH_LOG_PREFS = "zipy_crash_logs";
    private static final String LAST_CRASH_LOG_KEY = "zipy_last_crash_log";
    private Thread.UncaughtExceptionHandler previousHandler;
    private Context context;
    private static final long ANR_TIMEOUT_MS = 2000; // 2 seconds timeout for ANR
    private Handler handler;
    private boolean anrDetected = false;

    private ANRWatchDog anrWatchDog;

    private String zipyKey;
    private int customerId;
    private String sessionId;
    private String streamURL;

    private String zipyKeyAnr;
    private int customerIdAnr;
    private String sessionIdAnr;
    private String streamURLAnr;

    public ZipyaiReactNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void setupExceptionHandler(String zipyKey, int customerId, String sessionId, String streamURL) {
        this.zipyKey = zipyKey;
        this.customerId = customerId;
        this.sessionId = sessionId;
        this.streamURL = streamURL;

        previousHandler = Thread.getDefaultUncaughtExceptionHandler();

        if (previousHandler != null && previousHandler.getClass().getName().contains(HANDLER_NAME)) {
            return;
        }

        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            try {
                // Capture stack trace details
                String errorMessage = Log.getStackTraceString(throwable);
                // Log.i(HANDLER_NAME, "Uncaught Exception: " + errorMessage);

                // Extract additional information for the JSON object
                String firstStackTraceLine = extractFirstMeaningfulStackLine(errorMessage);
                String crashLocation = extractCrashLocation(errorMessage);
                String mainCrashLine = extractErrorName(errorMessage);
                String processName = getProcessName1();
                int pid = Process.myPid();
                long event_time = System.currentTimeMillis();

                // Schedule the crash log to be sent via WorkManager
                Data data = new Data.Builder()
                        .putString(CrashLogWorker.KEY_ZIPY_KEY, zipyKey)
                        .putInt(CrashLogWorker.KEY_CUSTOMER_ID, customerId)
                        .putString(CrashLogWorker.KEY_SESSION_ID, sessionId)
                        .putString(CrashLogWorker.KEY_STREAM_URL, streamURL)
                        .putString(CrashLogWorker.KEY_ERROR_MESSAGE, errorMessage)
                        .putString(CrashLogWorker.KEY_FIRST_STACK_LINE, firstStackTraceLine)
                        .putString(CrashLogWorker.KEY_MAIN_CRASH_LINE, mainCrashLine)
                        .putString(CrashLogWorker.KEY_CRASH_LOCATION, crashLocation)
                        .putString(CrashLogWorker.KEY_PROCESS_INFO, "PID: " + pid)
                        .putString(CrashLogWorker.KEY_PACKAGE_NAME, processName)
                        .putLong(CrashLogWorker.EVENT_TIME, event_time)
                        .build();

                OneTimeWorkRequest crashLogWork = new OneTimeWorkRequest.Builder(CrashLogWorker.class)
                        .setInitialDelay(10, TimeUnit.SECONDS)
                        .setInputData(data)
                        .addTag("CrashLogWork")
                        .build();

                WorkManager.getInstance(context).enqueue(crashLogWork);
            } catch (Exception e) {
                Log.e(HANDLER_NAME, "Error while handling uncaught exception: " + e.getMessage());
            } finally {
                if (previousHandler != null) {
                    previousHandler.uncaughtException(thread, throwable);
                } else {
                    System.exit(2);
                }
            }
        });

        // Log.i(HANDLER_NAME, "ZipyExceptionHandler is now set.");
    }

    // Function to get process name
    private String getProcessName1() {
        ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        if (manager != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : manager.getRunningAppProcesses()) {
                if (processInfo.pid == Process.myPid()) {
                    return processInfo.processName;
                }
            }
        }
        return "Unknown Process";
    }

    // Extract first meaningful stack line from stack trace
    private String extractFirstMeaningfulStackLine(String stackTrace) {
        String[] lines = stackTrace.split("\n");
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.startsWith("at")) {
                return line;
            }
        }
        return "Unknown Line";
    }

    // Extract crash location
    private String extractCrashLocation(String stackTrace) {
        Pattern pattern = Pattern.compile("\\(([^)]+)\\)");
        Matcher matcher = pattern.matcher(stackTrace);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "Unknown Location";
    }

    // Method to extract the main crash line (the first line in the stack trace)
    private String extractErrorName(String stackTrace) {
        if (stackTrace == null || stackTrace.isEmpty()) {
            return "Unknown Line";
        }

        // Split the stack trace into lines
        String[] lines = stackTrace.split("\n");
        // Return the first line directly, trimming any whitespace
        return lines[0].trim();
    }

    @ReactMethod
    public void resetExceptionHandler() {
        if (previousHandler != null) {
            Thread.setDefaultUncaughtExceptionHandler(previousHandler);
            // Log.i(HANDLER_NAME, "Previous exception handler restored.");
        } else {
            // Log.i(HANDLER_NAME, "No previous exception handler to restore.");
        }
    }

    // Worker class for handling crash logs
    public static class CrashLogWorker extends Worker {
        public static final String KEY_ZIPY_KEY = "zipy_key";
        public static final String KEY_CUSTOMER_ID = "customer_id";
        public static final String KEY_SESSION_ID = "session_id";
        public static final String KEY_STREAM_URL = "stream_url";
        public static final String KEY_ERROR_MESSAGE = "zipy_error_message";
        public static final String KEY_FIRST_STACK_LINE = "first_stack_line";
        public static final String KEY_MAIN_CRASH_LINE = "main_crash_line";
        public static final String KEY_CRASH_LOCATION = "crash_location";
        public static final String KEY_PROCESS_INFO = "process_info";
        public static final String KEY_PACKAGE_NAME = "package_name";
        public static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
        public static final String EVENT_TIME = "event_time";
        public static final String KEY_RETRY_COUNT = "retry_count";
        public static final String KEY_PID = "pid";

        public CrashLogWorker(@NonNull Context context, @NonNull WorkerParameters params) {
            super(context, params);
        }

        @NonNull
        @Override
        public Result doWork() {
            String zipyKey = getInputData().getString(KEY_ZIPY_KEY);
            int customerId = getInputData().getInt(KEY_CUSTOMER_ID, 0);
            String sessionId = getInputData().getString(KEY_SESSION_ID);
            String streamURL = getInputData().getString(KEY_STREAM_URL);
            String errorMessage = getInputData().getString(KEY_ERROR_MESSAGE);
            String firstStackLine = getInputData().getString(KEY_FIRST_STACK_LINE);
            String mainCrashLine = getInputData().getString(KEY_MAIN_CRASH_LINE);
            String crashLocation = getInputData().getString(KEY_CRASH_LOCATION);
            String processInfo = getInputData().getString(KEY_PROCESS_INFO);
            String packageName = getInputData().getString(KEY_PACKAGE_NAME);
            long eventTime = getInputData().getLong(EVENT_TIME, 0L);
            int retryCount = getInputData().getInt(KEY_RETRY_COUNT, 0); // Default retry count is 0
            // Remove "at " at the start if it exists
            if (firstStackLine.startsWith("at ")) {
                firstStackLine = firstStackLine.substring(3);
            }

            // Remove the file information at the end, e.g.,
            // "(ZipyaiReactNativeModule.java:398)"
            firstStackLine = firstStackLine.replaceAll("\\(.*?\\)", "");

            String[] parts = mainCrashLine.split(":", 2);
            String name = parts[0].trim();
            String reason = parts.length > 1 ? parts[1].trim() : "";

            if (retryCount >= 5) {
                // Log.e(HANDLER_NAME, "Max retry attempts reached, giving up.");
                return Result.failure(); // Fail after 5 retries
            }

            try {
                // JSON construction
                JSONObject jsonEvent = new JSONObject();
                JSONObject eventDetails = new JSONObject();
                JSONObject eventData = new JSONObject();
                JSONObject data = new JSONObject();
                JSONArray eventDetailsArray = new JSONArray();

                // Event data construction
                data.put("message", firstStackLine);
                data.put("name", name);
                data.put("reason", reason);
                data.put("stack", errorMessage);
                data.put("type", ""); // You can specify the type if necessary
                data.put("location", crashLocation);
                data.put("processInfo", processInfo);
                data.put("packageName", packageName);
                data.put("screenName", ""); // Add screen name if available

                eventData.put("data", data);

                // Event details construction
                eventDetails.put("category", "ERRORS");
                eventDetails.put("subCategory", "CRASH");
                eventDetails.put("eventType", 31);
                eventDetails.put("eventData", eventData);
                eventDetails.put("timestamp", eventTime);

                eventDetailsArray.put(eventDetails);

                // Final JSON object construction
                jsonEvent.put("events", eventDetailsArray);
                jsonEvent.put("apiKey", zipyKey);
                jsonEvent.put("cId", customerId);
                jsonEvent.put("startTime", System.currentTimeMillis()); // Store the current timestamp
                jsonEvent.put("sessionId", sessionId);

                // Log the final event data
                // Log.e(HANDLER_NAME, " ************ EVENT DATA: " + jsonEvent.toString());

                // Send the JSON event data to the server using POST
                boolean result = sendCrashData(streamURL, jsonEvent.toString(), sessionId);

                if (result) {
                    return Result.success();
                } else {
                    // Retry logic
                    retryCount++; // Increment retry count
                    Data newInputData = new Data.Builder()
                            .putString(KEY_ZIPY_KEY, zipyKey)
                            .putInt(KEY_CUSTOMER_ID, customerId)
                            .putString(KEY_SESSION_ID, sessionId)
                            .putString(KEY_STREAM_URL, streamURL)
                            .putString(KEY_ERROR_MESSAGE, errorMessage)
                            .putString(KEY_PID, processInfo)
                            .putLong(EVENT_TIME, eventTime)
                            .putInt(KEY_RETRY_COUNT, retryCount) // Pass updated retry count
                            .build();

                    OneTimeWorkRequest retryWork = new OneTimeWorkRequest.Builder(CrashLogWorker.class)
                            .setInitialDelay(10, TimeUnit.SECONDS)
                            .setInputData(newInputData)
                            .addTag("CrashLogWork")
                            .build();

                    WorkManager.getInstance(getApplicationContext()).enqueue(retryWork);
                    return Result.retry(); // Retry the work
                }
            } catch (JSONException e) {
                Log.e(HANDLER_NAME, "Error constructing JSON: " + e.getMessage());
                return Result.failure();
            }
        }

        private boolean sendCrashData(String streamURL, String jsonData, String sessionId) {
            OkHttpClient client = new OkHttpClient();
            RequestBody body = RequestBody.create(JSON, jsonData);
            Request request = new Request.Builder()
                    .url(streamURL + "/crash_events?sid=" + sessionId)
                    .post(body)
                    .build();

            try {
                // Log the full request before sending
                // Log.i(HANDLER_NAME, "Request: " + request.toString());

                Response response = client.newCall(request).execute();
                if (response.isSuccessful()) {
                    Log.i(HANDLER_NAME, "Crash data sent successfully.");
                    return true;
                } else {
                    // Log.e(HANDLER_NAME, "Failed to send crash data. Response code: " + response.code());
                    return false;
                }
            } catch (Exception e) {
                Log.e(HANDLER_NAME, "Error sending crash data: " + e.getMessage());
                return false;
            }
        }
    }

    @ReactMethod
    public void testCrash(Promise promise) {
        throw new RuntimeException("TEST - Zipy test Crash");
    }

    @ReactMethod
    public void testANR(int duration, Promise promise) {
        new Handler(Looper.getMainLooper()).post(() -> {
            // Log.i("ZipyaiReactNative", "Simulating ANR for " + duration + " seconds");
            try {
                // Block the main thread for the specified duration (in seconds)
                Thread.sleep(duration * 1000);
                promise.resolve(true);
            } catch (InterruptedException e) {
                promise.reject("test_anr", "Error during ANR simulation", e);
            }
        });
    }

    // Required for NativeEventEmitter to work properly
    @ReactMethod
    public void addListener(String eventName) {
        // Keep track of event listeners if needed (optional implementation)
        // Log.d(NAME, "addListener called for event: " + eventName);
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep track of event listeners if needed (optional implementation)
        // Log.d(NAME, "removeListeners called. Listener count: " + count);
    }

    @ReactMethod
    public void startANRMonitoring(String zipyKeyAnr, int customerIdAnr, String sessionIdAnr, String streamURLAnr) {

        this.zipyKeyAnr = zipyKeyAnr;
        this.customerIdAnr = customerIdAnr;
        this.sessionIdAnr = sessionIdAnr;
        this.streamURLAnr = streamURLAnr;

        // Log.e(TAG, "ANR Capturing started ******************");

        // Retrieve the package name dynamically
        String packageName = context.getPackageName();

        // Set a timeout for ANR detection (5 seconds in this example)
        anrWatchDog = new ANRWatchDog(5000);
        anrWatchDog.setANRListener(error -> {
            long startTime = System.currentTimeMillis();

            // Main thread details as JSONObject
            JSONObject mainThreadDetails = new JSONObject();
            try {
                Thread mainThread = Looper.getMainLooper().getThread();
                mainThreadDetails.put("name", mainThread.getName());
                mainThreadDetails.put("state", mainThread.getState().toString());
                mainThreadDetails.put("threadId", mainThread.getId());

                // Collect stack trace of the main thread
                StringBuilder mainStackTraceBuilder = new StringBuilder();
                StackTraceElement[] mainThreadStack = mainThread.getStackTrace();
                String packageNameLine = null;
                String anrLocation = null;

                for (StackTraceElement element : mainThreadStack) {
                    String traceLine = element.toString();
                    mainStackTraceBuilder.append(traceLine).append("\n");

                    // Check for package name in stack trace
                    if (packageNameLine == null && traceLine.contains(packageName)) {
                        packageNameLine = traceLine.replaceFirst("^\\s*at\\s+", "");

                        // Extract file name and line number using regex
                        Matcher matcher = Pattern.compile("\\(([^)]+)\\)").matcher(packageNameLine);
                        if (matcher.find()) {
                            anrLocation = matcher.group(1); // Extract content within parentheses
                            packageNameLine = packageNameLine.replace(matcher.group(0), "");
                        }
                    }
                }

                // If no package line is found, use the first line
                if (packageNameLine == null && mainThreadStack.length > 0) {
                    packageNameLine = mainThreadStack[0].toString().replaceFirst("^\\s*at\\s+", "");
                }

                mainThreadDetails.put("stacktrace", mainStackTraceBuilder.toString());

                // Collect all threads' stack traces
                JSONArray allThreadStackTraces = new JSONArray();
                for (Map.Entry<Thread, StackTraceElement[]> entry : Thread.getAllStackTraces().entrySet()) {
                    JSONObject threadDetails = new JSONObject();
                    threadDetails.put("name", entry.getKey().getName());
                    threadDetails.put("state", entry.getKey().getState().toString());
                    threadDetails.put("threadId", entry.getKey().getId());

                    JSONArray stackTraceArray = new JSONArray();
                    for (StackTraceElement element : entry.getValue()) {
                        stackTraceArray.put(element.toString());
                    }
                    threadDetails.put("stacktrace", stackTraceArray);

                    allThreadStackTraces.put(threadDetails);
                }

                packageNameLine = packageNameLine.replaceAll("\\(.*?\\)", "");

                // Exception details
                JSONObject exceptionDetails = new JSONObject();
                exceptionDetails.put("message", packageNameLine);
                exceptionDetails.put("mainThreadStackTrace", mainThreadDetails);
                exceptionDetails.put("threadCount", Thread.getAllStackTraces().size());
                exceptionDetails.put("location", anrLocation);
                exceptionDetails.put("packageName", packageName);
                exceptionDetails.put("name", "");

                long event_time = System.currentTimeMillis();

                // Schedule WorkManager job for the anr log
                Data data = new Data.Builder()
                        .putString("zipyKey", zipyKeyAnr)
                        .putInt("customerId", customerIdAnr)
                        .putString("sessionId", sessionIdAnr)
                        .putString("streamURL", streamURLAnr)
                        .putString("anrMessage", exceptionDetails.toString())
                        .putLong("event_time", event_time)
                        .putInt("retry_count", 0) // Initialize retry count to 0
                        .build();

                OneTimeWorkRequest anrLogWork = new OneTimeWorkRequest.Builder(ANRLogWorker.class)
                        .setInitialDelay(10, TimeUnit.SECONDS)
                        .setInputData(data)
                        .addTag("ANRLogWork")
                        .build();

                WorkManager.getInstance(context).enqueue(anrLogWork);

                // Log.e(TAG, "ANR detected! Exception details: " + exceptionDetails.toString());

            } catch (JSONException e) {
                Log.e(TAG, "JSON error: " + e.getMessage());
            }
        }).start();
    }

    public static class ANRLogWorker extends Worker {

        public static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
        private static final int MAX_RETRY_COUNT = 5;

        public ANRLogWorker(@NonNull Context context, @NonNull WorkerParameters params) {
            super(context, params);
        }

        @NonNull
        @Override
        public Result doWork() {
            String zipyKey = getInputData().getString("zipyKey");
            int customerId = getInputData().getInt("customerId", 0);
            String sessionId = getInputData().getString("sessionId");
            String streamURL = getInputData().getString("streamURL");
            String errorMessage = getInputData().getString("anrMessage");

            long event_time = getInputData().getLong("event_time", 0L);

            try {
                // Construct JSON data to send
                JSONObject jsonEvent = new JSONObject();
                JSONObject eventDetails = new JSONObject();
                JSONObject eventData = new JSONObject();
                JSONArray eventDetailsArray = new JSONArray();
                JSONObject errorMessageJson = new JSONObject(errorMessage);

                eventData.put("data", errorMessageJson);

                eventDetails.put("category", "ERRORS");
                eventDetails.put("subCategory", "ANR");
                eventDetails.put("eventType", 30);
                eventDetails.put("eventData", eventData);
                eventDetails.put("timestamp", event_time);
                eventDetailsArray.put(eventDetails);

                jsonEvent.put("events", eventDetailsArray);
                jsonEvent.put("apiKey", zipyKey);
                jsonEvent.put("cId", customerId);
                jsonEvent.put("startTime", System.currentTimeMillis());
                jsonEvent.put("sessionId", sessionId);

                // Log.e(HANDLER_NAME, " ************ EVENT DATA: " + jsonEvent.toString());

                // Retry the network call up to MAX_RETRY_COUNT times
                boolean result = sendCrashData(streamURL, jsonEvent.toString(), sessionId);

                if (result) {
                    return Result.success();
                } else {
                    Log.e(HANDLER_NAME, "Failed to send anr data after " + MAX_RETRY_COUNT + " attempts.");
                    return Result.failure(); // Fail after 5 attempts
                }

            } catch (JSONException e) {
                Log.e(HANDLER_NAME, "Error constructing JSON: " + e.getMessage());
                return Result.failure();
            }
        }

        // Method to send the JSON data to the server with retry logic for network call
        private boolean sendCrashData(String streamURL, String jsonData, String sessionId) {
            OkHttpClient client = new OkHttpClient();
            String url = streamURL + "/crash_events?sid=" + sessionId;

            RequestBody body = RequestBody.create(JSON, jsonData);
            Request request = new Request.Builder().url(url).post(body).build();

            for (int retryCount = 0; retryCount < MAX_RETRY_COUNT; retryCount++) {
                try {
                    Response response = client.newCall(request).execute();
                    if (response.isSuccessful()) {
                        // Log.i(HANDLER_NAME, "ANR data sent successfully on attempt " + (retryCount + 1));
                        return true;
                    } else {
                        // Log.e(HANDLER_NAME,
                        //         "Failed attempt " + (retryCount + 1) + ": Response code " + response.code());
                    }
                } catch (Exception e) {
                    Log.e(HANDLER_NAME,
                            "Error sending anr data on attempt " + (retryCount + 1) + ": " + e.getMessage());
                }

                // Wait before retrying, if needed
                try {
                    TimeUnit.SECONDS.sleep(10);
                } catch (InterruptedException e) {
                    Log.e(HANDLER_NAME, "Retry sleep interrupted: " + e.getMessage());
                }
            }

            // Log failure after MAX_RETRY_COUNT attempts
            // Log.e(HANDLER_NAME, "Exhausted all retry attempts for sending anr data.");
            return false;
        }
    }

    // Helper method to collect all thread stack traces with detailed key-value
    // pairs
    private Map<String, Object> getStackTrace(Map<Thread, StackTraceElement[]> allStackTraces) {
        Map<String, Object> allThreadsStackTrace = new LinkedHashMap<>();

        for (Map.Entry<Thread, StackTraceElement[]> entry : allStackTraces.entrySet()) {
            Thread thread = entry.getKey();
            StackTraceElement[] stackTraceElements = entry.getValue();

            // Prepare the map for each thread's details
            Map<String, Object> threadDetails = new HashMap<>();

            StringBuilder stackTraceBuilder = new StringBuilder();

            // Build the stack trace as a single string
            for (StackTraceElement element : stackTraceElements) {
                stackTraceBuilder.append(element.toString()).append("\n");
            }

            // Add thread details (similar to the main thread)
            threadDetails.put("thread_id", thread.getId());
            threadDetails.put("module",
                    thread.getThreadGroup() != null ? thread.getThreadGroup().getName() : "Unknown");
            threadDetails.put("name", thread.getName());
            threadDetails.put("label", getThreadLabel(thread)); // Custom method to get thread state labels like sleep,
                                                                // wait, etc.
            threadDetails.put("state", thread.getState().toString());
            threadDetails.put("stateOn", "0x" + Long.toHexString(System.identityHashCode(thread)));
            threadDetails.put("stacktrace", stackTraceBuilder.toString());

            // Store each thread's details with the thread's name as the key
            allThreadsStackTrace.put(thread.getName(), threadDetails);
        }

        return allThreadsStackTrace;
    }

    // Helper method to collect the main thread stack trace with detailed key-value
    // pairs
    private Map<String, Object> getMainThreadStackTrace() {
        Thread mainThread = Looper.getMainLooper().getThread();
        StackTraceElement[] stackTraceElements = mainThread.getStackTrace();

        // Prepare the map for main thread details
        Map<String, Object> mainThreadDetails = new HashMap<>();
        StringBuilder stackTraceBuilder = new StringBuilder();

        // Build the stack trace as a single string
        for (StackTraceElement element : stackTraceElements) {
            stackTraceBuilder.append(element.toString()).append("\n");
        }

        // Add the main thread details
        mainThreadDetails.put("thread_id", mainThread.getId());
        mainThreadDetails.put("module", "Main Module"); // Add the appropriate module name if available
        mainThreadDetails.put("name", mainThread.getName());
        mainThreadDetails.put("label", getThreadLabel(mainThread)); // Custom method for thread state labels
        mainThreadDetails.put("state", mainThread.getState().toString());
        mainThreadDetails.put("stateOn", "0x" + Long.toHexString(System.identityHashCode(mainThread)));
        mainThreadDetails.put("stacktrace", stackTraceBuilder.toString());

        return mainThreadDetails;
    }

    // Helper method to define a label for the thread (e.g., sleep, wait, etc.)
    private String getThreadLabel(Thread thread) {
        switch (thread.getState()) {
            case TIMED_WAITING:
                return "SLEEP";
            case WAITING:
                return "WAITING";
            case BLOCKED:
                return "SYNCHRONIZED";
            default:
                return "RUNNING";
        }
    }

    // Method to recursively convert a Map to a WritableMap
    private WritableMap convertMapToWritableMap(Map<String, Object> map) {
        WritableMap writableMap = Arguments.createMap();

        for (Map.Entry<String, Object> entry : map.entrySet()) {
            Object value = entry.getValue();

            if (value instanceof String) {
                writableMap.putString(entry.getKey(), (String) value);
            } else if (value instanceof Integer) {
                writableMap.putInt(entry.getKey(), (Integer) value);
            } else if (value instanceof Long) {
                writableMap.putDouble(entry.getKey(), (Long) value);
            } else if (value instanceof Double) {
                writableMap.putDouble(entry.getKey(), (Double) value);
            } else if (value instanceof Map) {
                writableMap.putMap(entry.getKey(), convertMapToWritableMap((Map<String, Object>) value));
            } else if (value instanceof List) {
                writableMap.putArray(entry.getKey(), convertListToWritableArray((List<Object>) value));
            } else {
                writableMap.putString(entry.getKey(), value.toString());
            }
        }

        return writableMap;
    }

    // Method to recursively convert a List to a WritableArray
    private WritableArray convertListToWritableArray(List<Object> list) {
        WritableArray writableArray = Arguments.createArray();

        for (Object item : list) {
            if (item instanceof String) {
                writableArray.pushString((String) item);
            } else if (item instanceof Integer) {
                writableArray.pushInt((Integer) item);
            } else if (item instanceof Long) {
                writableArray.pushDouble((Long) item);
            } else if (item instanceof Double) {
                writableArray.pushDouble((Double) item);
            } else if (item instanceof Map) {
                writableArray.pushMap(convertMapToWritableMap((Map<String, Object>) item));
            } else if (item instanceof List) {
                writableArray.pushArray(convertListToWritableArray((List<Object>) item));
            } else {
                writableArray.pushString(item.toString());
            }
        }

        return writableArray;
    }

    // Method to send ANR event to React Native
    private void sendANREvent(Map<String, Object> exceptionDetails) {
        WritableMap map = convertMapToWritableMap(exceptionDetails);
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("ZipyANRDetected", map);
    }

    // Helper method to get process name (Android-specific)
    private String getProcessName() {
        ActivityManager am = (ActivityManager) getReactApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        if (am != null) {
            for (ActivityManager.RunningAppProcessInfo processInfo : am.getRunningAppProcesses()) {
                if (processInfo.pid == android.os.Process.myPid()) {
                    return processInfo.processName;
                }
            }
        }
        return "Unknown";
    }

    @ReactMethod
    public void getDeviceInfo(Promise promise) {
        try {
            WritableMap deviceInfo = Arguments.createMap();

            // Get app version
            try {
                String appVersion = getReactApplicationContext().getPackageManager()
                        .getPackageInfo(getReactApplicationContext().getPackageName(), 0).versionName;
                deviceInfo.putString("zms_version", appVersion);
            } catch (Exception e) {
                deviceInfo.putString("zms_version", "Unknown");
            }

            // Get app build number
            try {
                String appBuildNumber = String.valueOf(
                        getReactApplicationContext().getPackageManager()
                                .getPackageInfo(getReactApplicationContext().getPackageName(), 0).versionCode);
                deviceInfo.putString("app_build_number", appBuildNumber);
            } catch (Exception e) {
                deviceInfo.putString("app_build_number", "Unknown");
            }

            // Get system version
            try {
                String systemVersion = Build.VERSION.RELEASE != null ? Build.VERSION.RELEASE : "Unknown";
                deviceInfo.putString("system_version", systemVersion);
            } catch (Exception e) {
                deviceInfo.putString("system_version", "Unknown");
            }

            // Get device ID
            try {
                String deviceId = Settings.Secure.getString(getReactApplicationContext().getContentResolver(),
                        Settings.Secure.ANDROID_ID);
                deviceInfo.putString("device_id", deviceId);
            } catch (Exception e) {
                deviceInfo.putString("device_id", "");
            }

            // Get device model
            try {
                String deviceModel = Build.MODEL != null ? Build.MODEL : "Unknown";
                deviceInfo.putString("device_model", deviceModel);
            } catch (Exception e) {
                deviceInfo.putString("device_model", "Unknown");
            }

            // Get device name
            try {
                String deviceName = Build.DEVICE != null ? Build.DEVICE : "Unknown";
                deviceInfo.putString("device_name", deviceName);
            } catch (Exception e) {
                deviceInfo.putString("device_name", "Unknown");
            }

            // Get manufacturer
            try {
                String manufacturer = Build.MANUFACTURER != null ? Build.MANUFACTURER : "Unknown";
                deviceInfo.putString("manufacturer", manufacturer);
            } catch (Exception e) {
                deviceInfo.putString("manufacturer", "Unknown");
            }

            // Get system name
            try {
                String systemName = "Android";
                deviceInfo.putString("system_name", systemName);
            } catch (Exception e) {
                deviceInfo.putString("system_name", "Unknown");
            }

            // Get screen dimensions
            try {
                WindowManager windowManager = (WindowManager) getReactApplicationContext()
                        .getSystemService(Context.WINDOW_SERVICE);
                DisplayMetrics displayMetrics = new DisplayMetrics();
                if (windowManager != null) {
                    windowManager.getDefaultDisplay().getMetrics(displayMetrics);
                }
                int width = displayMetrics.widthPixels;
                int height = displayMetrics.heightPixels;
                deviceInfo.putString("screen_dimensions", width + " X " + height);
                
                // Check if device is a tablet based on screen size
                float smallestWidth = Math.min(width, height) / displayMetrics.density;
                deviceInfo.putString("device_type", smallestWidth >= 600 ? "Tablet" : "Mobile");
            } catch (Exception e) {
                deviceInfo.putString("screen_dimensions", "Unknown");
                deviceInfo.putString("device_type", "Mobile");
            }

            // Get network connection type
            try {
                ConnectivityManager cm = (ConnectivityManager) getReactApplicationContext()
                        .getSystemService(Context.CONNECTIVITY_SERVICE);
                String networkConnection = "None";
                if (cm != null) {
                    NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
                    networkConnection = activeNetwork != null && activeNetwork.isConnected()
                            ? activeNetwork.getTypeName()
                            : "None";
                }
                deviceInfo.putString("network_connection", networkConnection);
            } catch (Exception e) {
                deviceInfo.putString("network_connection", "Unknown");
            }

            // Get architecture information
            try {
                String architecture = Build.SUPPORTED_ABIS != null && Build.SUPPORTED_ABIS.length > 0
                        ? Build.SUPPORTED_ABIS[0]
                        : Build.CPU_ABI;
                deviceInfo.putString("architecture", architecture);
            } catch (Exception e) {
                deviceInfo.putString("architecture", "Unknown");
            }

            promise.resolve(deviceInfo);
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    @ReactMethod
    public void getContextualInfo(Promise promise) {
        try {
            WritableMap deviceInfo = Arguments.createMap();

            BatteryManager batteryManager = (BatteryManager) getReactApplicationContext()
                    .getSystemService(Context.BATTERY_SERVICE);
            int batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
            boolean isCharging = batteryManager.isCharging();

            int orientation = getReactApplicationContext().getResources().getConfiguration().orientation;
            String orientationString = (orientation == Configuration.ORIENTATION_LANDSCAPE) ? "landscape" : "portrait";

            // Free Storage
            StatFs statFs = new StatFs(Environment.getDataDirectory().getAbsolutePath());
            long freeStorageBytes = statFs.getAvailableBytes();
            String freeStorageGB = String.format("%dGB", freeStorageBytes / (1024 * 1024 * 1024));

            // Total Storage
            BigInteger totalStorageBytes = BigInteger.ZERO;
            try {
                StatFs rootDir = new StatFs(Environment.getRootDirectory().getAbsolutePath());
                StatFs dataDir = new StatFs(Environment.getDataDirectory().getAbsolutePath());

                BigInteger rootDirCapacity = getDirTotalCapacity(rootDir);
                BigInteger dataDirCapacity = getDirTotalCapacity(dataDir);

                totalStorageBytes = rootDirCapacity.add(dataDirCapacity);
            } catch (Exception e) {
                Log.e(TAG, "Error calculating total storage capacity", e);
            }
            String totalStorageGB = String.format("%dGB",
                    totalStorageBytes.divide(BigInteger.valueOf(1024 * 1024 * 1024)).longValue());

            // Total Memory
            ActivityManager.MemoryInfo memoryInfo = new ActivityManager.MemoryInfo();
            ActivityManager activityManager = (ActivityManager) getReactApplicationContext()
                    .getSystemService(Context.ACTIVITY_SERVICE);
            activityManager.getMemoryInfo(memoryInfo);
            long totalMemoryBytes = memoryInfo.totalMem;
            String totalMemoryMB = String.format("%dMB", totalMemoryBytes / (1024 * 1024));

            // Used Memory using getProcessMemoryInfo (App-specific memory usage)
            ActivityManager actMgr = (ActivityManager) getReactApplicationContext()
                    .getSystemService(Context.ACTIVITY_SERVICE);
            long usedMemoryBytesApp = -1;
            if (actMgr != null) {
                int pid = android.os.Process.myPid();
                android.os.Debug.MemoryInfo[] memInfos = actMgr.getProcessMemoryInfo(new int[] { pid });
                if (memInfos.length == 1) {
                    android.os.Debug.MemoryInfo memInfo = memInfos[0];
                    usedMemoryBytesApp = memInfo.getTotalPss() * 1024L;
                } else {
                    // Log.e(TAG,
                    //         "Unable to getProcessMemoryInfo. getProcessMemoryInfo did not return any info for the PID");
                }
            } else {
                // Log.e(TAG, "Unable to getProcessMemoryInfo. ActivityManager was null");
            }
            String usedMemoryMBApp = (usedMemoryBytesApp != -1)
                    ? String.format("%dMB", usedMemoryBytesApp / (1024 * 1024))
                    : "N/A";

            // Used Memory (Device-wide memory usage)
            long usedMemoryBytesDevice = totalMemoryBytes - memoryInfo.availMem;
            String usedMemoryMBDevice = String.format("%dMB", usedMemoryBytesDevice / (1024 * 1024));

            deviceInfo.putString("battery_level", batteryLevel + "%");
            deviceInfo.putBoolean("is_charging", isCharging);
            deviceInfo.putString("orientation", orientationString);
            deviceInfo.putString("free_storage", freeStorageGB);
            deviceInfo.putString("total_memory", totalMemoryMB);
            deviceInfo.putString("used_memory_app", usedMemoryMBApp);
            deviceInfo.putString("used_memory_device", usedMemoryMBDevice);
            deviceInfo.putString("total_storage", totalStorageGB);

            promise.resolve(deviceInfo);
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }

    private BigInteger getDirTotalCapacity(StatFs statFs) {
        long blockSize = statFs.getBlockSizeLong();
        long blockCount = statFs.getBlockCountLong();
        return BigInteger.valueOf(blockSize).multiply(BigInteger.valueOf(blockCount));
    }

    @ReactMethod
    public void captureScreenshot(String timestamp, boolean masking, String session_id, Promise promise) {
        try {
            // Log.d(TAG, "Starting screenshot capture");
    
            Activity currentActivity = getCurrentActivity();
            if (currentActivity == null) {
                Log.e(TAG, "No current activity found");
                promise.reject("NoActivity", "No current activity found");
                return;
            }
    
            Window window = currentActivity.getWindow();
            if (window == null) {
                Log.e(TAG, "Window is null");
                promise.reject("NullWindow", "Window is null");
                return;
            }
    
            View view = window.getDecorView().getRootView();
            if (view == null || view.getWidth() <= 0 || view.getHeight() <= 0) {
                Log.e(TAG, "Invalid root view");
                promise.reject("InvalidRootView", "Root view is invalid or has zero dimensions");
                return;
            }
    

            // Calculate the bounding box coordinates
            int[] location = new int[2];
            view.getLocationOnScreen(location);
            int left = Math.max(0, location[0]);
            int statusBarHeight = Math.max(0, getStatusBarHeight());
            int top = Math.max(0, location[1] + statusBarHeight);
            Log.e(TAG, "Location: left=" + left + ", top=" + top + ", statusBarHeight=" + statusBarHeight + ", location[1]=" + location[1]);
            int viewWidth = view.getWidth();
            int viewHeight = view.getHeight();
            int right = Math.min(left + viewWidth, view.getWidth());
            int navigationBarHeight = getNavigationBarHeight();
            int bottom = Math.min(viewHeight, viewHeight - navigationBarHeight);

            if (right <= left || bottom <= top) {
                Log.e(TAG, "Invalid bitmap coordinates: left=" + left + ", top=" + top + ", right=" + right + ", bottom=" + bottom);
                promise.reject("InvalidCoordinates", "Invalid bitmap coordinates calculated");
                return;
            }

            Bitmap fullBitmap = Bitmap.createBitmap(view.getWidth(), view.getHeight(), Bitmap.Config.ARGB_8888);
            CountDownLatch latch = new CountDownLatch(1);
    
            // Check if we can use PixelCopy (Android Oreo and above)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Log.d(TAG, "Using PixelCopy for screenshot capture");
                HandlerThread handlerThread = new HandlerThread("PixelCopyHelper");
                handlerThread.start();
                Handler handler = new Handler(handlerThread.getLooper());
    
                PixelCopy.request(window, fullBitmap, copyResult -> {
                    if (copyResult == PixelCopy.SUCCESS) {
                        latch.countDown();
                    } else {
                        // Log.e(TAG, "PixelCopy failed with result code: " + copyResult);
                        promise.reject("PixelCopyError", "Failed to capture screenshot using PixelCopy");
                        latch.countDown();
                    }
                }, handler);
    
                latch.await(1, TimeUnit.SECONDS);
                handlerThread.quitSafely();
            } else {
                // Fallback to using Canvas for older Android versions
                Canvas canvas = new Canvas(fullBitmap);
                view.draw(canvas);
                latch.countDown();
            }
            // Log.d(TAG, "Waiting for the screenshot to be captured");

            latch.await(1, TimeUnit.SECONDS);
    
            // Crop the bitmap to the specific bounds
            Bitmap croppedBitmap = Bitmap.createBitmap(fullBitmap, left, top, right - left, bottom - top);
            if (croppedBitmap == null) {
                Log.e(TAG, "Failed to create cropped bitmap");
                promise.reject("BitmapCreationFailed", "Failed to create cropped bitmap");
                return;
            }
    
            Canvas canvas = new Canvas(croppedBitmap);
            Paint paint = new Paint();
            paint.setColor(0xFF000000);  // Black color for masking
            maskInputFields(view, canvas, paint, getStatusBarHeight(), masking);
            // Log.d(TAG, "Masking the input fields");

            File filesDir = getReactApplicationContext().getFilesDir();
            File directory = new File(filesDir, "zipy-sessions/" + session_id);
            if (!directory.exists() && !directory.mkdirs()) {
                Log.e(TAG, "Failed to create directory");
                promise.reject("DirectoryCreationFailed", "Failed to create directory");
                return;
            }
    
            String fileName = timestamp + ".webp";
            File file = new File(directory, fileName);
            // Log.d(TAG, "Saving the screenshot");

            try (FileOutputStream fos = new FileOutputStream(file)) {
                if (!croppedBitmap.compress(Bitmap.CompressFormat.WEBP, 20, fos)) {
                    Log.e(TAG, "Bitmap compression failed");
                    promise.reject("CompressionFailed", "Bitmap compression failed");
                    return;
                }
                Log.d(TAG, "Screenshot saved to file path ");
                promise.resolve(file.getAbsolutePath());
            } catch (IOException e) {
                Log.e(TAG, "IOException while saving screenshot", e);
                promise.reject("FileWriteIOException", e.getMessage());
            }
        } catch (Exception e) {
            Log.e(TAG, "General error capturing screenshot", e);
            promise.reject("CaptureError", e.getMessage());
        }
    }
    
    private int getStatusBarHeight() {
        try {
            Rect rectangle = new Rect();
            Activity currentActivity = getCurrentActivity();
            if (currentActivity != null) {
                Window window = currentActivity.getWindow();
                if (window != null) {
                    window.getDecorView().getWindowVisibleDisplayFrame(rectangle);
                    int statusBarHeight = Math.max(0, rectangle.top);
                    return statusBarHeight;
                } else {
                    Log.e(TAG, "Window is null in getStatusBarHeight");
                }
            } else {
                Log.e(TAG, "Current activity is null in getStatusBarHeight");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting status bar height", e);
        }
        Log.d(TAG, "Returning default status bar height: 0");
        return 0;
    }

    private int getNavigationBarHeight() {
        try {
            int resourceId = getReactApplicationContext().getResources().getIdentifier("navigation_bar_height", "dimen",
                    "android");
            if (resourceId > 0) {
                return getReactApplicationContext().getResources().getDimensionPixelSize(resourceId);
            } else {
                Log.e(TAG, "Navigation bar height resource not found");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting navigation bar height", e);
        }
        return 0;
    }

    private void maskInputFields(View view, Canvas canvas, Paint paint, int statusBarHeight, boolean shouldMask) {
        if (view == null)
            return;
        try {
            // Check for zipy-block testID
            String testId = (String) view.getTag();
            if (testId != null && testId.equals("zipy-block")) {
                int[] location = new int[2];
                view.getLocationOnScreen(location);
                int left = location[0];
                int top = location[1] - statusBarHeight;
                int right = left + view.getWidth();
                int bottom = top + view.getHeight();
                canvas.drawRect(left, top, right, bottom, paint);
            }
            // Check for text input fields
            else if (view instanceof EditText && shouldMask) {
                int[] location = new int[2];
                view.getLocationOnScreen(location);
                int left = location[0];
                int top = location[1] - statusBarHeight;
                int right = left + view.getWidth();
                int bottom = top + view.getHeight();
                canvas.drawRect(left, top, right, bottom, paint);
            }
            
            // Recursively check child views
            if (view instanceof ViewGroup) {
                ViewGroup viewGroup = (ViewGroup) view;
                for (int i = 0; i < viewGroup.getChildCount(); i++) {
                    maskInputFields(viewGroup.getChildAt(i), canvas, paint, statusBarHeight, shouldMask);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error masking input fields", e);
        }
    }

    @ReactMethod
    public void stopANRMonitoring() {
        try {
            if (anrWatchDog != null) {
                anrWatchDog.interrupt();
                anrWatchDog = null;
      
            }
        } catch (Exception e) {

        }
    }

    @ReactMethod
    public void stopCrashMonitoring() {
        try {
            // Reset to default handler if exists
            if (previousHandler != null) {
                Thread.setDefaultUncaughtExceptionHandler(previousHandler);
                previousHandler = null;
   
            }
        } catch (Exception e) {

        }
    }

}

package ru.topa.timedelivery.services;

import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
public class HomeService {

    public List<String> getCarousel() {

        String folderPath = "D:/Downlands/TimeDelivery/img/news";
        File folder = new File(folderPath);
        if (folder.exists()) {
            File[] files = folder.listFiles();
            if (files != null) {
                List<String> imageFiles = new ArrayList<>();
                for (File file : files) {
                    if (file.getName().endsWith(".jpg") || file.getName().endsWith(".webp") || file.getName().endsWith(".png")) {
                        imageFiles.add(file.getName());
                    }
                }
                return imageFiles;
            }
        }
        return new ArrayList<>();
    }

}

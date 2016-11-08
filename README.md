# phys860
[![Binder](http://mybinder.org/badge.svg)](http://mybinder.org/repo/aaronfowles/phys860)

## Low contrast penetration

### Running the notebook

Click on the 'launch binder' button at the top of this file to launch the Jupyter Notebook used for development. Or view it [here](index.ipynb).

### Locating the JavaScript file

The code for the low contrast penetration algorithm is contained in the JavaScript file `ImageJ/macros/QA/low_contrast_penetration.js`

### Running the algorithm

1. Clone the repo onto your local machine using `clone https://github.com/aaronfowles/phys860`
2. Change into the cloned directory `cd phys860`
3. Run the ImageJ.exe executable
4. File>Open an appropriate ultrasound DICOM image file from `phys860/DICOM_IMAGES/`
5. In ImageJ go to Plugin>Macros>Run from the toolbar
6. In the file picker navigate to the directory `phys860/ImageJ/macros/QA/` and open the file `low_contrast_penetration.js`

const { SystemSetting } = require("../models");

const getSettings = async () => {
    let settings = await SystemSetting.findOne();
    if (!settings) settings = await SystemSetting.create({});
    return settings;
};

const updateSettings = async (data) => {
    const settings = await getSettings();
    await settings.update({
        companyName: data.companyName ?? settings.companyName,
        taxNumber: data.taxNumber ?? settings.taxNumber,
        phone: data.phone ?? settings.phone,
        address: data.address ?? settings.address,
        logoUrl: data.logoUrl ?? settings.logoUrl,
        printTitleColor: data.printTitleColor ?? settings.printTitleColor,
        printAccentColor: data.printAccentColor ?? settings.printAccentColor,
        showLogo: data.showLogo ?? settings.showLogo,
        showTaxNumber: data.showTaxNumber ?? settings.showTaxNumber,
        invoiceFooter: data.invoiceFooter ?? settings.invoiceFooter
    });
    return await getSettings();
};

module.exports = { getSettings, updateSettings };
